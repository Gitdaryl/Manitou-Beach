import { Resend } from 'resend';
import QRCode from 'qrcode';

// slug <-> Offer name in the Promo Claims Notion DB
const BIZ = {
  cafe: {
    offer: 'Blackbird Cookie',
    name: 'Blackbird Cafe & Baking Company',
    offerText: 'free cookie',
    emoji: '🍪',
    accent: '#D4845A',
    cap: 20,
    expiresLabel: 'Expires May 31',
    ownerEmails: ['admin@yetigroove.com'], // swap for Blackbird owner email when shared
  },
};

const DB_ID = process.env.NOTION_DB_PROMO_CLAIMS;
const NOTION_TOKEN = process.env.NOTION_TOKEN_BUSINESS;

function generateCode(prefix = 'BB') {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${rand}`;
}

async function sendClaimEmail({ email, name, slug, claimCode }) {
  if (!process.env.RESEND_API_KEY) {
    console.error('[claim-email] RESEND_API_KEY missing');
    return { ok: false, reason: 'no_api_key' };
  }
  const biz = BIZ[slug];
  if (!biz) return { ok: false, reason: 'no_biz' };
  const siteUrl = process.env.SITE_URL || 'https://manitoubeachmichigan.com';
  const resend = new Resend(process.env.RESEND_API_KEY);
  const redeemUrl = `${siteUrl}/redeem/${slug}?code=${encodeURIComponent(claimCode)}`;
  let qrDataUrl = null;
  try {
    qrDataUrl = await QRCode.toDataURL(redeemUrl, { width: 300, margin: 1 });
  } catch (err) {
    console.error('[claim-email] QR generation failed:', err.message);
  }
  try {
    const result = await resend.emails.send({
      from: 'The Manitou Dispatch <events@manitoubeachmichigan.com>',
      to: email,
      reply_to: 'hello@manitoubeachmichigan.com',
      subject: `Your code for ${biz.name}: ${claimCode}`,
      text: `Hi${name ? ' ' + name.split(' ')[0] : ''},\n\nYou're all set. Show this code to your barista at ${biz.name}:\n\n${claimCode}\n\nGood for one ${biz.offerText}. ${biz.expiresLabel}.\n\nClaim page: ${siteUrl}/claim/${slug}\n\n- The Manitou Dispatch\nManitou Beach, Michigan`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#FAF6EF;">
          <div style="text-align:center;margin-bottom:24px;">
            <div style="font-size:42px;margin-bottom:8px;">${biz.emoji}</div>
            <h1 style="color:#1A2830;font-size:22px;margin:0 0 6px;">You're all set${name ? ', ' + name.split(' ')[0] : ''}!</h1>
            <p style="color:#5C5248;font-size:15px;margin:0;">Show this email (or the code) to your barista at ${biz.name}.</p>
          </div>
          <div style="background:#1A2830;border-radius:14px;padding:28px 24px;text-align:center;margin-bottom:24px;">
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:rgba(255,255,255,0.5);margin-bottom:10px;">Claim Code</div>
            <div style="font-family:Georgia,serif;font-size:38px;color:#fff;letter-spacing:0.1em;font-weight:700;">${claimCode}</div>
            ${qrDataUrl ? `
              <div style="background:#fff;display:inline-block;padding:10px;border-radius:10px;margin-top:16px;">
                <img src="${qrDataUrl}" alt="Claim QR code" width="160" height="160" style="display:block;" />
              </div>
              <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:10px;">Show this QR to your barista, or read them the code above</div>
            ` : ''}
            <div style="font-size:13px;color:rgba(255,255,255,0.55);margin-top:14px;">${biz.offerText} · one use</div>
          </div>
          <p style="color:#5C5248;font-size:14px;line-height:1.6;text-align:center;margin:0 0 20px;">
            Save this email so you've always got your code on hand. ${biz.expiresLabel}.
          </p>
          <p style="text-align:center;margin:0;">
            <a href="${siteUrl}/claim/${slug}" style="color:${biz.accent};font-size:14px;text-decoration:none;">Open your claim page →</a>
          </p>
          <p style="margin-top:32px;color:#8C806E;font-size:12px;text-align:center;">The Manitou Dispatch · Manitou Beach, Michigan</p>
        </div>
      `,
    });
    if (result?.error) {
      console.error('[claim-email] Resend returned error:', JSON.stringify(result.error));
      return { ok: false, reason: 'resend_error', detail: result.error };
    }
    console.log('[claim-email] sent to', email, 'id:', result?.data?.id);
    return { ok: true, id: result?.data?.id };
  } catch (err) {
    console.error('[claim-email] threw:', err.message, err.stack);
    return { ok: false, reason: 'exception', detail: err.message };
  }
}

async function queryByEmailOffer(email, offer) {
  const res = await fetch(`https://api.notion.com/v1/databases/${DB_ID}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      filter: {
        and: [
          { property: 'Email', email: { equals: email } },
          { property: 'Offer', select: { equals: offer } },
        ],
      },
      page_size: 1,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function countByOffer(offer) {
  const res = await fetch(`https://api.notion.com/v1/databases/${DB_ID}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      filter: { property: 'Offer', select: { equals: offer } },
      page_size: 100,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  const emails = (data.results || [])
    .map(r => r.properties?.Email?.email)
    .filter(Boolean);
  return new Set(emails).size;
}

function parseRow(row) {
  return {
    id: row.id,
    code: row.properties?.['Promo Code']?.title?.[0]?.text?.content || '',
    name: row.properties?.Name?.rich_text?.[0]?.text?.content || '',
    email: row.properties?.Email?.email || '',
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};

  // --- Rating / feedback update ---
  if (body.notionId) {
    const { notionId, rating, feedback, googleClicked } = body;
    const properties = {};
    if (rating)        properties['Rating']         = { number: rating };
    if (feedback)      properties['Feedback']       = { rich_text: [{ text: { content: feedback } }] };
    if (googleClicked) properties['Google Clicked'] = { checkbox: true };
    if (Object.keys(properties).length === 0) {
      return res.status(400).json({ error: 'Nothing to update' });
    }
    try {
      const notionRes = await fetch(`https://api.notion.com/v1/pages/${notionId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${NOTION_TOKEN}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({ properties }),
      });
      if (!notionRes.ok) {
        const err = await notionRes.text();
        console.error('Notion submit-rating error:', err);
        return res.status(500).json({ error: 'Failed to record rating' });
      }

      // Low-rating alert to vendor (best-effort)
      if (rating && rating <= 3 && feedback && process.env.RESEND_API_KEY) {
        try {
          const page = await notionRes.json();
          const offer = page?.properties?.Offer?.select?.name;
          const customerName = page?.properties?.Name?.rich_text?.[0]?.text?.content || 'A customer';
          const bizEntry = Object.values(BIZ).find(b => b.offer === offer);
          const recipients = bizEntry?.ownerEmails || [];
          if (recipients.length) {
            const resend = new Resend(process.env.RESEND_API_KEY);
            await resend.emails.send({
              from: 'The Manitou Dispatch <events@manitoubeachmichigan.com>',
              to: recipients,
              subject: `Heads up: ${rating}-star feedback from ${bizEntry?.name || 'a customer'}`,
              html: `
                <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:28px 20px;">
                  <h2 style="color:#1A2830;margin:0 0 8px;">Private feedback came in</h2>
                  <p style="color:#5C5248;margin:0 0 18px;font-size:15px;">
                    ${customerName} rated their visit <strong>${rating} star${rating === 1 ? '' : 's'}</strong> and left this note:
                  </p>
                  <blockquote style="margin:0;padding:16px 20px;background:#FAF6EF;border-left:3px solid #D4845A;color:#3B3228;font-size:15px;line-height:1.5;">
                    ${feedback.replace(/[<>]/g, c => ({ '<': '&lt;', '>': '&gt;' }[c]))}
                  </blockquote>
                  <p style="color:#8C806E;font-size:13px;margin-top:20px;">
                    They chose "tell them directly" instead of leaving a public review. That's a gift; a follow-up usually wins them back.
                  </p>
                </div>
              `,
            });
          }
        } catch (err) {
          console.error('Low-rating email failed:', err.message);
        }
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('submit-rating error:', err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  // --- Resend existing code to email ---
  if (body.action === 'resend') {
    const { slug, email } = body;
    const biz = BIZ[slug];
    if (!biz || !email || !email.includes('@')) {
      return res.status(400).json({ error: 'slug and valid email required' });
    }
    try {
      const data = await queryByEmailOffer(email.toLowerCase().trim(), biz.offer);
      if (!data.results || data.results.length === 0) {
        return res.status(404).json({ error: "We couldn't find a claim for that email. Try claiming again." });
      }
      const row = parseRow(data.results[0]);
      await sendClaimEmail({ email, name: row.name, slug, claimCode: row.code });
      return res.status(200).json({ success: true, notionId: row.id, claimCode: row.code });
    } catch (err) {
      console.error('resend-claim error:', err.message);
      return res.status(500).json({ error: 'Lookup failed' });
    }
  }

  // --- New claim ---
  const { slug, name, email } = body;
  const biz = BIZ[slug];
  if (!biz || !name || !email || !email.includes('@')) {
    return res.status(400).json({ error: 'slug, name, and valid email required' });
  }
  const cleanEmail = email.toLowerCase().trim();

  try {
    // Reuse existing claim if this email already claimed
    const existing = await queryByEmailOffer(cleanEmail, biz.offer);
    if (existing.results && existing.results.length > 0) {
      const row = parseRow(existing.results[0]);
      const emailResult = await sendClaimEmail({ email: cleanEmail, name, slug, claimCode: row.code });
      return res.status(200).json({ notionId: row.id, claimCode: row.code, reused: true, emailResult });
    }

    // Enforce cap
    if (biz.cap) {
      const count = await countByOffer(biz.offer);
      if (count >= biz.cap) {
        return res.status(409).json({
          error: `All ${biz.cap} spots are claimed. Thanks for your interest!`,
          soldOut: true,
        });
      }
    }

    const claimCode = generateCode('BB');

    const notionRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: { database_id: DB_ID },
        properties: {
          'Promo Code': { title: [{ text: { content: claimCode } }] },
          'Name':       { rich_text: [{ text: { content: name } }] },
          'Email':      { email: cleanEmail },
          'Offer':      { select: { name: biz.offer } },
          'Status':     { select: { name: 'Unclaimed' } },
          'Claimed At': { date: { start: new Date().toISOString() } },
        },
      }),
    });

    if (!notionRes.ok) {
      const err = await notionRes.text();
      console.error('Notion submit-claim error:', err);
      return res.status(500).json({ error: 'Failed to record claim' });
    }

    const page = await notionRes.json();

    const emailResult = await sendClaimEmail({ email: cleanEmail, name, slug, claimCode });

    return res.status(200).json({ notionId: page.id, claimCode, emailResult });
  } catch (err) {
    console.error('submit-claim error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
