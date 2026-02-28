import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are The Yeti — the editorial voice of The Manitou Dispatch, a community newsletter and blog for Manitou Beach and Devils Lake, Michigan.

Your writing style:
- Warm, fun, and genuinely witty — like a knowledgeable local who's actually lived it
- Clean, vivid metaphors (lake life, seasons, small-town rhythms) — never forced or corporate
- You write FOR the community, not AT them — readers are neighbors, not an audience
- Conversational but polished — not sloppy, not stuffy
- Humor is dry and situational — no puns for puns' sake
- You love this place. That comes through in every line.

Format your response as valid JSON with this exact structure:
{
  "title": "Article title (punchy, 5-10 words)",
  "slug": "url-friendly-slug-from-title",
  "excerpt": "One compelling sentence (max 160 chars) that makes someone want to read more",
  "editorNote": "1-3 sentences in first person from The Yeti — a personal aside, local angle, or playful observation about the topic. Conversational, not formal. Signs off naturally as The Yeti.",
  "coverImageSuggestion": "yeti-activity.png — pick the most fitting activity from: yeti-drone.png, yeti-selfie.png, yeti-jetski.png, yeti-lighthouse.png, yeti-camera.png, yeti-painting.png, yeti-fishing.png, yeti-fireworks.png, yeti-boating.png, yeti-beach.png, yeti-campfire.png, yeti-writing.png. If none fit, suggest a new logical filename like yeti-[activity].png",
  "blocks": [
    { "type": "paragraph", "text": "..." },
    { "type": "heading_2", "text": "..." },
    { "type": "paragraph", "text": "..." }
  ]
}

Block types available: paragraph, heading_2, heading_3, quote, callout, divider
- Use heading_2 for major sections (2-4 per article)
- Use heading_3 sparingly for sub-points
- Use quote for memorable lines or local wisdom worth pulling out
- Use callout for tips, local intel, or "Yeti's take" asides
- Use divider to break major section shifts
- Write 600-900 words total across all paragraph blocks
- No heading_1 (title is handled separately)`;

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 80);
}

function blocksToNotion(blocks) {
  return blocks.map(block => {
    const richText = [{ type: 'text', text: { content: block.text || '' } }];

    switch (block.type) {
      case 'paragraph':
        return { object: 'block', type: 'paragraph', paragraph: { rich_text: richText } };
      case 'heading_2':
        return { object: 'block', type: 'heading_2', heading_2: { rich_text: richText } };
      case 'heading_3':
        return { object: 'block', type: 'heading_3', heading_3: { rich_text: richText } };
      case 'quote':
        return { object: 'block', type: 'quote', quote: { rich_text: richText } };
      case 'callout':
        return { object: 'block', type: 'callout', callout: { rich_text: richText, icon: { emoji: '🏔️' } } };
      case 'divider':
        return { object: 'block', type: 'divider', divider: {} };
      default:
        return { object: 'block', type: 'paragraph', paragraph: { rich_text: richText } };
    }
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic, category = 'Lake Life', notes = '' } = req.body || {};

  if (!topic) {
    return res.status(400).json({ error: 'topic is required' });
  }

  try {
    // Generate article with Claude
    const userPrompt = `Write an article for The Manitou Dispatch about: ${topic}
Category: ${category}${notes ? `\nAdditional notes: ${notes}` : ''}

Remember: Yeti Groove voice — fun, warm, grounded in lake life. Not a press release.`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    // Parse the JSON response
    const rawText = message.content[0].text;
    let article;
    try {
      // Strip markdown code fences if present
      const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      article = JSON.parse(cleaned);
    } catch {
      console.error('Failed to parse Claude response:', rawText);
      return res.status(500).json({ error: 'AI response could not be parsed', raw: rawText });
    }

    const slug = article.slug || slugify(article.title);
    const notionBlocks = blocksToNotion(article.blocks || []);

    // Save draft to Notion
    const notionRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN_DISPATCH}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: { database_id: process.env.NOTION_DB_DISPATCH_ARTICLES },
        properties: {
          'Title': { title: [{ text: { content: article.title } }] },
          'Slug': { rich_text: [{ text: { content: slug } }] },
          'Excerpt': { rich_text: [{ text: { content: article.excerpt || '' } }] },
          'Category': { select: { name: category } },
          'Author': { rich_text: [{ text: { content: 'The Yeti' } }] },
          'Status': { select: { name: 'Draft' } },
          'AI Generated': { checkbox: true },
          'Blog Safe': { checkbox: false },
          'Editor\'s Note': { rich_text: [{ text: { content: article.editorNote || '' } }] },
          'Cover Image Suggestion': { rich_text: [{ text: { content: article.coverImageSuggestion || '' } }] },
        },
        children: notionBlocks,
      }),
    });

    if (!notionRes.ok) {
      const notionErr = await notionRes.text();
      console.error('Notion save failed:', notionErr);
      return res.status(500).json({ error: 'Failed to save to Notion', details: notionErr });
    }

    const notionPage = await notionRes.json();

    return res.status(200).json({
      success: true,
      title: article.title,
      slug,
      excerpt: article.excerpt,
      editorNote: article.editorNote,
      coverImageSuggestion: article.coverImageSuggestion,
      notionUrl: `https://notion.so/${notionPage.id.replace(/-/g, '')}`,
      notionId: notionPage.id,
    });
  } catch (err) {
    console.error('generate-article error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
