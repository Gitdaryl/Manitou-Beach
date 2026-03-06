import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import { searchUnsplash } from './_unsplash.js';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are The Yeti — the editorial voice of The Manitou Dispatch, a community newsletter and blog for Manitou Beach and Devils Lake, Michigan.

Your writing style:
- Warm, fun, and genuinely witty — like a knowledgeable local who's actually lived it
- Clean, vivid metaphors (lake life, seasons, small-town rhythms) — never forced or corporate
- You write FOR the community, not AT them — readers are neighbors, not an audience
- Conversational but polished — not sloppy, not stuffy
- Humor is dry and situational — no puns for puns' sake
- You love this place. That comes through in every line.

## Cover Image Library
Choose the best cover image from this catalog. Two visual styles exist — pick intentionally.

ILLUSTRATED (cartoon, white background — use for fun, casual, community, listicles, light content):
- yeti-celebrates.png → celebrations, community wins, event announcements
- yeti-influencer.png → social media trends, local buzz, influencer/viral pieces
- yeti-box-camera.png → history, nostalgia, vintage community stories
- yeti-camera-reverse.png → behind-the-scenes, community event coverage
- yeti-camera.png → journalism, reporting, "the Yeti was there" pieces
- yeti-clapper-board.png → film, video, entertainment, performances
- yeti-clapper.png → same as above (use as variant if clapper-board already used)
- yeti-direct-one-more-time.png → directing, producing, creative leadership
- yeti-director.png → community leadership, explainers, "here's how it works"
- yeti-drone.png → aerial perspective, big-picture takes, overview/survey articles
- yeti-front-profile.png → personal essays, general byline pieces
- yeti-futurist.png → future of community, development, what's coming
- yeti-painting.png → arts & culture, creativity, local artists, DIY
- yeti-selfie.png → personal takes, "I was there", casual community content
- yeti-aviator.png → travel, adventure, getting out on the water/trails

REALISM (photorealistic, cinematic — use for feature stories, immersive narratives, emotional depth):
- yeti-deck-camera-realism.png → documentary pieces, lake photography, nature writing
- yeti-deck-sunset-realism.png → lifestyle features, summer living, golden hour vibes
- yeti-jetski-realism.png → water sports, summer action, lake recreation features
- yeti-lighthouse-realism.png → local history, landmark stories, community identity

Style guide:
- Illustrated = fun, accessible, light tone. Lists, tips, event previews, community roundups.
- Realism = cinematic, immersive, weight. Feature stories, place narratives, emotional long reads.
- When the article has a clear activity match, pick that image. When ambiguous, illustrated is safer.
- If no existing image fits well, suggest a new filename like yeti-[activity].png or yeti-[activity]-realism.png.

Format your response as valid JSON with this exact structure:
{
  "title": "Article title (punchy, 5-10 words)",
  "slug": "url-friendly-slug-from-title",
  "excerpt": "One compelling sentence (max 160 chars) that makes someone want to read more",
  "editorNote": "1-3 sentences in first person from The Yeti — a personal aside, local angle, or playful observation about the topic. Conversational, not formal. Signs off naturally as The Yeti.",
  "coverImage": "exact-filename.png from the catalog above, or a new suggested filename",
  "coverStyle": "illustrated OR realism",
  "coverNote": "One sentence explaining why this image and style fits this article — helps the editor know what to create if the file doesn't exist yet",
  "blocks": [
    { "type": "paragraph", "text": "..." },
    { "type": "heading_2", "text": "..." },
    { "type": "paragraph", "text": "..." }
  ]
}

Block types available: paragraph, heading_2, heading_3, quote, callout, divider
- Use heading_2 for 1-2 sections max — keep the structure lean
- Use heading_3 sparingly for sub-points only if genuinely needed
- Use quote for a single memorable line or piece of local wisdom
- Use callout for one "Yeti's take" aside max — don't stack them
- Use divider to break major section shifts
- Write 250-350 words total across all paragraph blocks — this is a newsletter digest piece, not a long-form blog post. Sharp, warm, punchy. Every sentence earns its place.
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

  const token = req.headers['x-admin-token'];
  if (!token || token !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const body = req.body || {};

  // action=cover — just search Unsplash, no article generation
  if (body.action === 'cover' || (body.query && !body.topic)) {
    const query = body.query || body.q;
    if (!query) return res.status(400).json({ error: 'query required' });
    try {
      const photo = await searchUnsplash(query);
      if (!photo) return res.status(404).json({ error: 'No photos found for this query' });
      return res.status(200).json(photo);
    } catch (err) {
      console.error('fetch-cover-image error:', err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  const { topic, category = 'Lake Life', notes = '' } = body;

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

    // Check if the suggested Yeti catalog image already exists in the public folder
    const coverFilename = article.coverImage || '';
    const coverFilePath = path.join(process.cwd(), 'public', 'images', 'yeti', coverFilename);
    const coverImageExists = coverFilename ? fs.existsSync(coverFilePath) : false;
    let coverImageUrl = coverImageExists ? `/images/yeti/${coverFilename}` : null;

    // Auto-fetch Unsplash photo if no Yeti catalog image is available
    let unsplashPhoto = null;
    if (!coverImageUrl) {
      try {
        unsplashPhoto = await searchUnsplash(topic);
        if (unsplashPhoto) coverImageUrl = unsplashPhoto.url;
      } catch (err) {
        console.error('Unsplash fetch failed (non-fatal):', err.message);
      }
    }

    // Build Cover Image Suggestion — Yeti catalog recommendation + Unsplash credit if used
    const suggestionParts = [article.coverImage, article.coverStyle, article.coverNote].filter(Boolean);
    if (unsplashPhoto) {
      suggestionParts.push(`unsplash: ${unsplashPhoto.credit} | ${unsplashPhoto.photographerUrl} | ${unsplashPhoto.photoPageUrl}`);
    }
    const coverImageSuggestion = suggestionParts.join(' | ');

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
          'Cover Image Suggestion': { rich_text: [{ text: { content: coverImageSuggestion } }] },
          ...(coverImageUrl ? { 'Cover Image URL': { url: coverImageUrl } } : {}),
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
      coverImage: article.coverImage,
      coverStyle: article.coverStyle,
      coverNote: article.coverNote,
      coverImageApplied: coverImageExists,
      unsplashPhoto: unsplashPhoto || null,
      notionUrl: `https://notion.so/${notionPage.id.replace(/-/g, '')}`,
      notionId: notionPage.id,
    });
  } catch (err) {
    console.error('generate-article error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
