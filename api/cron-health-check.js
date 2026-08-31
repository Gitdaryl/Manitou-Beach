// /api/cron-health-check.js
// The weekly "is anything quietly broken?" sweep.
//
// The failure this exists to prevent is the silent one. A Facebook token expires, the
// food truck posts stop going out, and nobody notices for three weeks because nothing
// errors - it just does less. Detection beats rotation: almost none of these credentials
// expire on a schedule, so checking them is far more useful than replacing them.
//
// Written to be read by whoever is holding the phone. If Daryl is not around, his wife
// should be able to act on this without knowing what any of it is called. So: no jargon,
// say what still works, and never report a problem without saying what to do about it.

import { requireCronOrAdmin } from './lib/cronAuth.js';
import { sendSMSFull } from './lib/twilio.js';
import { Resend } from 'resend';
import { put, list } from '@vercel/blob';
import { CHECKS, runAllChecks } from './lib/healthChecks.js';

export const config = { maxDuration: 60 };

const STATE_PREFIX = 'health/last-run';

// Remembering last week is what lets the report say "this fixed itself" instead of
// silently forgetting, and stops a long-running fault being reported as brand new.
async function readState() {
  try {
    const { blobs } = await list({ prefix: STATE_PREFIX, token: process.env.BLOB_READ_WRITE_TOKEN });
    if (!blobs.length) return {};
    const latest = blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0];
    // Blob reads are edge cached, and a cached state file would make the report lie
    // about when something broke.
    const r = await fetch(`${latest.url}?t=${Date.now()}`, { cache: 'no-store' });
    return r.ok ? await r.json() : {};
  } catch {
    return {};
  }
}

async function writeState(state) {
  try {
    await put(`${STATE_PREFIX}.json`, JSON.stringify(state), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
  } catch (err) {
    console.error('Health check: could not save state:', err.message);
  }
}

const todayET = () => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Detroit', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date());

const prettyDate = (iso) => {
  if (!iso) return 'recently';
  const d = new Date(`${iso}T12:00:00Z`);
  return isNaN(d) ? 'recently' : d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' });
};

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function buildEmail({ broken, recovered, working, siteUrl }) {
  const headline = broken.length
    ? `${broken.length} thing${broken.length > 1 ? 's need' : ' needs'} looking at`
    : 'Everything is working';

  const problem = ({ check, result, since }) => `
    <div style="background:#fff;border:1px solid #E8DDD0;border-left:4px solid ${check.severity === 'critical' ? '#C0553E' : '#D4845A'};border-radius:8px;padding:20px 22px;margin-bottom:16px;">
      <h3 style="margin:0 0 6px;font-size:17px;color:#1A2830;">${esc(check.what)} stopped working</h3>
      <p style="margin:0 0 12px;font-size:12px;color:#8C806E;">Since ${esc(prettyDate(since))}</p>
      <p style="margin:0 0 12px;font-size:15px;color:#3A3028;line-height:1.7;">${esc(check.why)}</p>
      <p style="margin:0 0 16px;font-size:15px;color:#3A3028;line-height:1.7;"><strong>Still working:</strong> ${esc(check.stillOk)}</p>
      <div style="background:#F7F2E9;border-radius:6px;padding:14px 16px;">
        <div style="font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#8C806E;margin-bottom:8px;">What to do</div>
        <ol style="margin:0 0 14px;padding-left:20px;font-size:14.5px;color:#3A3028;line-height:1.75;">
          ${check.fix.steps.map(s => `<li style="margin-bottom:6px;">${esc(s)}</li>`).join('')}
        </ol>
        <div style="font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#8C806E;margin-bottom:6px;">Or copy this and send it to Claude</div>
        <div style="background:#fff;border:1px dashed #C9BCA8;border-radius:6px;padding:12px 14px;font-size:14px;color:#1A2830;line-height:1.6;">${esc(check.fix.askClaude)}</div>
      </div>
      <p style="margin:10px 0 0;font-size:11px;color:#B3A895;">Technical detail, only useful to Claude: ${esc(result.detail || result.kind || '')}</p>
    </div>`;

  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:640px;margin:0 auto;padding:28px 24px;background:#FAF6EF;">
    <div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#8C806E;margin-bottom:8px;">Manitou Beach · Weekly check</div>
    <h1 style="margin:0 0 6px;font-size:24px;color:#1A2830;font-weight:600;">${esc(headline)}</h1>
    <p style="margin:0 0 24px;font-size:14px;color:#6B6052;line-height:1.7;">
      This runs every Monday morning and looks at the things the site needs in order to work.
      ${broken.length ? 'Everything not listed below is fine.' : 'Nothing needs you this week.'}
    </p>

    ${broken.map(problem).join('')}

    ${recovered.length ? `
      <div style="background:#F1F4EE;border:1px solid #C3D0BC;border-radius:8px;padding:18px 20px;margin-bottom:16px;">
        <h3 style="margin:0 0 8px;font-size:16px;color:#3F5238;">Fixed on its own</h3>
        <p style="margin:0;font-size:14.5px;color:#3A3028;line-height:1.7;">
          ${recovered.map(r => esc(r.check.what)).join(', ')} ${recovered.length > 1 ? 'were' : 'was'} having trouble last week and ${recovered.length > 1 ? 'are' : 'is'} working again now. Nothing to do.
        </p>
      </div>` : ''}

    <div style="background:#fff;border:1px solid #E8DDD0;border-radius:8px;padding:18px 20px;">
      <div style="font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#8C806E;margin-bottom:10px;">Checked and working</div>
      <ul style="margin:0;padding-left:20px;font-size:14.5px;color:#3A3028;line-height:1.9;">
        ${working.map(w => `<li>${esc(w.check.what)}</li>`).join('')}
      </ul>
    </div>

    <p style="margin:24px 0 0;font-size:12px;color:#B3A895;line-height:1.7;">
      Sent by the Manitou Beach site itself. <a href="${siteUrl}" style="color:#8C806E;">${esc(siteUrl.replace('https://', ''))}</a>
    </p>
  </div>`;
}

export default async function handler(req, res) {
  if (!requireCronOrAdmin(req, res)) return;

  const siteUrl = process.env.SITE_URL || 'https://manitoubeachmichigan.com';
  const today = todayET();

  // ?preview=1 renders the alert as if everything had failed at once, so the wording can
  // be read and corrected now rather than discovered in the middle of an actual outage.
  // An alert nobody has ever seen is an alert nobody can be sure is understandable.
  if (req.query?.preview === '1') {
    const html = buildEmail({
      broken: CHECKS.map(check => ({ check, result: { detail: 'example only, nothing is actually wrong' }, since: today })),
      recovered: [],
      working: [],
      siteUrl,
    });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  }

  const previous = await readState();
  const results = await runAllChecks();

  const broken = [];
  const recovered = [];
  const working = [];
  const state = {};

  for (const { check, result } of results) {
    if (result.ok) {
      working.push({ check, result });
      if (previous[check.id]?.broken) recovered.push({ check, result });
      state[check.id] = { broken: false, lastOk: today };
    } else {
      // Keep the date it first went wrong, so a fault that has been sitting there for a
      // month says so rather than looking like it happened this morning.
      const since = previous[check.id]?.broken ? previous[check.id].since : today;
      broken.push({ check, result, since });
      state[check.id] = { broken: true, since, detail: result.detail || result.kind };
    }
  }

  await writeState(state);

  // Only interrupt someone's day when something is actually wrong. A weekly "all clear"
  // text is how alerts become background noise, and the email is there if they want it.
  const dryRun = req.query?.dryRun === '1';
  let notified = 'none';

  if (!dryRun && (broken.length || recovered.length)) {
    const adminEmail = process.env.ADMIN_EMAIL || 'daryl@manitoubeachmichigan.com';
    if (process.env.RESEND_API_KEY && adminEmail) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'Manitou Beach <tickets@manitoubeachmichigan.com>',
          to: adminEmail,
          subject: broken.length
            ? `Manitou Beach: ${broken.length} thing${broken.length > 1 ? 's need' : ' needs'} looking at`
            : 'Manitou Beach: everything is working again',
          html: buildEmail({ broken, recovered, working, siteUrl }),
        });
        notified = 'email';
      } catch (err) {
        console.error('Health check: email failed:', err.message);
      }
    }

    // The text is the interrupt, the email is the instructions. Keep it short and say
    // where to look, rather than trying to fit a fix into a text message.
    if (broken.length && process.env.ADMIN_PHONE) {
      const names = broken.map(b => b.check.what.toLowerCase()).join(' and ');
      await sendSMSFull(
        process.env.ADMIN_PHONE,
        `Manitou Beach weekly check: ${names} stopped working. The rest of the site is fine. Check your email - it says what to do, including a message you can copy to Claude.`
      );
      notified = notified === 'email' ? 'email+sms' : 'sms';
    }
  }

  return res.status(200).json({
    ok: true,
    date: today,
    dryRun,
    notified,
    broken: broken.map(b => ({ id: b.check.id, what: b.check.what, since: b.since, detail: b.result.detail })),
    recovered: recovered.map(r => r.check.id),
    working: working.map(w => w.check.id),
  });
}
