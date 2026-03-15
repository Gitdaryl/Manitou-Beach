// /api/qa-agent.js
// QA Agent — evaluates pending food truck registrations via Claude
// Runs on cron every 30 min, or trigger manually via POST /api/qa-agent
//
// Notion Status flow:  Pending → Active (approved) | Rejected | Flagged
// Required env vars:   ANTHROPIC_API_KEY, NOTION_TOKEN_BUSINESS,
//                      NOTION_DB_FOOD_TRUCKS, TWILIO_ACCOUNT_SID,
//                      TWILIO_AUTH_TOKEN, TWILIO_PHONE, DARYL_PHONE

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const pending = await getPendingTrucks();

    if (!pending.length) {
      return res.status(200).json({ ok: true, processed: 0, message: 'No pending trucks' });
    }

    const results = { approved: [], rejected: [], flagged: [] };

    for (const truck of pending) {
      let decision, reason;
      try {
        ({ decision, reason } = await evaluateTruck(truck));
      } catch (err) {
        console.error(`Claude eval failed for ${truck.name}:`, err.message);
        decision = 'FLAG';
        reason = 'Evaluation error — manual review needed';
      }

      await updateTruckStatus(truck.pageId, decision, reason);

      const bucket = decision === 'APPROVE' ? 'approved' : decision === 'REJECT' ? 'rejected' : 'flagged';
      results[bucket].push({ name: truck.name, reason });
      console.log(`QA: ${decision} — ${truck.name} — ${reason}`);
    }

    await sendSummary(results);

    return res.status(200).json({ ok: true, results });
  } catch (err) {
    console.error('QA agent error:', err.message);
    return res.status(500).json({ error: 'QA agent failed', detail: err.message });
  }
}

// ─── NOTION: fetch pending trucks ──────────────────────────────────────────

async function getPendingTrucks() {
  const response = await fetch(
    `https://api.notion.com/v1/databases/${process.env.NOTION_DB_FOOD_TRUCKS}/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        filter: { property: 'Status', select: { equals: 'Pending' } },
        page_size: 50,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Notion query failed: ${await response.text()}`);
  }

  const data = await response.json();

  return data.results
    .map(page => {
      const p = page.properties;
      return {
        pageId: page.id,
        name:        p['Name']?.title?.[0]?.text?.content || '',
        cuisine:     p['Cuisine']?.select?.name || '',
        description: p['Description']?.rich_text?.[0]?.text?.content || '',
        phone:       p['Phone']?.phone_number || '',
        slug:        p['Slug']?.rich_text?.[0]?.text?.content || '',
        token:       p['Checkin Token']?.rich_text?.[0]?.text?.content || '',
        website:     p['Website']?.url || '',
      };
    })
    .filter(t => t.name);
}

// ─── CLAUDE: evaluate a truck submission ───────────────────────────────────

async function evaluateTruck(truck) {
  const prompt = `You are a QA agent for Manitou Beach, a community food truck platform in Devils Lake, Michigan (Irish Hills Lakes region). Evaluate this food truck registration submission.

Submission:
- Name: "${truck.name}"
- Cuisine: "${truck.cuisine || '(not set)'}"
- Description: "${truck.description || '(not provided)'}"
- Phone: "${truck.phone || '(MISSING)'}"
- Slug: "${truck.slug || '(MISSING)'}"
- Check-in Token: "${truck.token ? '(present)' : '(MISSING)'}"
- Website: "${truck.website || '(none)'}"

Evaluation rules:
APPROVE — Name looks like a real food truck business. Cuisine is set. Phone is present. Slug is present. Check-in token is present. No red flags.
REJECT  — Name is gibberish, spam, profanity, or clearly a test/fake (e.g. "asdfgh", "fuck you", "fake truck"). Description contains hostile or inappropriate content.
FLAG    — Any required field is missing (phone, slug, or token). Name is unusual but not clearly fake. Something seems off but you're not certain. When in doubt, flag.

Important: "test-truck" and similar test entries should be FLAGGED, not approved or rejected — they may be legitimate platform tests.

Respond with valid JSON only, no other text:
{"decision": "APPROVE", "reason": "one short sentence explaining the decision"}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 120,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${await response.text()}`);
  }

  const data = await response.json();
  let text = data.content?.[0]?.text?.trim() || '';

  // Strip markdown code fences if Claude wrapped the JSON
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  try {
    const parsed = JSON.parse(text);
    const decision = ['APPROVE', 'REJECT', 'FLAG'].includes(parsed.decision) ? parsed.decision : 'FLAG';
    return { decision, reason: (parsed.reason || 'No reason provided').slice(0, 200) };
  } catch {
    // Try extracting JSON from anywhere in the response
    const match = text.match(/\{[^{}]*"decision"\s*:\s*"(APPROVE|REJECT|FLAG)"[^{}]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        return { decision: parsed.decision, reason: (parsed.reason || 'No reason provided').slice(0, 200) };
      } catch { /* fall through */ }
    }
    console.error('Failed to parse Claude response:', text);
    return { decision: 'FLAG', reason: 'Could not parse AI evaluation — manual review needed' };
  }
}

// ─── NOTION: update status + write QA notes ────────────────────────────────

async function updateTruckStatus(pageId, decision, reason) {
  const statusMap = { APPROVE: 'Active', REJECT: 'Rejected', FLAG: 'Flagged' };
  const newStatus = statusMap[decision] || 'Flagged';

  const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      properties: {
        'Status': { select: { name: newStatus } },
        'QA Notes': { rich_text: [{ type: 'text', text: { content: reason } }] },
      },
    }),
  });

  if (!response.ok) {
    console.error(`Notion update failed for ${pageId}:`, await response.text());
  }
}

// ─── TWILIO: text Daryl a summary ─────────────────────────────────────────

async function sendSummary(results) {
  const darylPhone = process.env.DARYL_PHONE;
  if (!darylPhone) { console.warn('DARYL_PHONE not set — skipping SMS summary'); return; }

  const total = results.approved.length + results.rejected.length + results.flagged.length;
  if (total === 0) return;

  const lines = ['🤖 MB QA Run'];
  if (results.approved.length) {
    lines.push(`✅ Approved (${results.approved.length}): ${results.approved.map(r => r.name).join(', ')}`);
  }
  if (results.rejected.length) {
    lines.push(`❌ Rejected (${results.rejected.length}): ${results.rejected.map(r => r.name).join(', ')}`);
  }
  if (results.flagged.length) {
    lines.push(`🟡 Needs review (${results.flagged.length}): ${results.flagged.map(r => r.name).join(', ')}`);
  }

  await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(
          `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
        ).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: process.env.TWILIO_PHONE,
        To: darylPhone,
        Body: lines.join('\n'),
      }).toString(),
    }
  );
}
