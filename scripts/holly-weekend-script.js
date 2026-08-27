#!/usr/bin/env node
// AI Holly weekend script generator.
// Runs Wednesday night: pull Thu-Sun published events, write the AI Holly
// script with Claude, persist it, then text Daryl the link for approval.
//
// Run: node scripts/holly-weekend-script.js
// Flags: --dry-run    fetch + generate, print to stdout, no blob, no file, no SMS
//        --no-notify  do everything except the SMS
//        --week=YYYY-MM-DD  force a specific Thursday instead of the next one
//
// Deliberately reads the PUBLIC /api/events endpoint rather than Notion. That
// endpoint is already filtered to published events and needs no token, so this
// script sees exactly what the website shows. If the site is wrong, the script
// is wrong in the same way, which is the behaviour we want.

import { writeFileSync, readFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import Anthropic from '@anthropic-ai/sdk'
import { put } from '@vercel/blob'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const siteUrl    = process.env.SITE_URL || 'https://manitoubeachmichigan.com'
const blobToken  = process.env.BLOB_READ_WRITE_TOKEN
const alertToken = process.env.ALERT_TOKEN || process.env.ADMIN_SECRET
const isDryRun   = process.argv.includes('--dry-run')
const noNotify   = process.argv.includes('--no-notify')
const weekArg    = (process.argv.find(a => a.startsWith('--week=')) || '').split('=')[1]

const MODEL = 'claude-opus-5'
const TZ = 'America/Detroit'

// ---------------------------------------------------------------- dates

// Today in Eastern Time as YYYY-MM-DD, regardless of what the runner thinks.
// GitHub runners are UTC and this fires late Wednesday night ET, which is
// already Thursday in UTC. Anchoring to ET is the whole point.
function etToday() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
}

function addDays(ymd, n) {
  const d = new Date(`${ymd}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().split('T')[0]
}

function dayName(ymd) {
  return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'long' })
    .format(new Date(`${ymd}T12:00:00Z`))
}

// The Thursday that starts the coming weekend. Running Wednesday night that is
// tomorrow. Running any other day it is the next Thursday on or after today,
// so a manual re-run mid-week still targets a sensible window.
function weekendWindow() {
  if (weekArg) {
    return [0, 1, 2, 3].map(n => addDays(weekArg, n))
  }
  const today = etToday()
  const dow = new Date(`${today}T12:00:00Z`).getUTCDay() // 0 Sun .. 4 Thu
  const untilThursday = (4 - dow + 7) % 7
  const thursday = addDays(today, untilThursday)
  return [0, 1, 2, 3].map(n => addDays(thursday, n))
}

// ---------------------------------------------------------------- events

function timeToMinutes(t) {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec((t || '').trim())
  if (!m) return 9999
  let h = parseInt(m[1], 10) % 12
  if (/pm/i.test(m[3])) h += 12
  return h * 60 + parseInt(m[2], 10)
}

async function fetchEvents(days) {
  // Cache-bust. /api/events sets s-maxage=300, so a plain fetch can hand back a
  // feed from five minutes ago. That is harmless on the normal Wednesday run and
  // actively wrong when someone has just corrected an event and re-run this to
  // pick the fix up, which is exactly what happened on 2026-08-20 with a paint
  // and sip priced at $40 that went out captioned free.
  const res = await fetch(`${siteUrl}/api/events?_cb=${Date.now()}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`events API ${res.status}: ${await res.text()}`)
  const body = await res.json()
  const all = Array.isArray(body) ? body : (body.events || body.results || [])

  const first = days[0]
  const last  = days[days.length - 1]

  return all
    .filter(e => {
      if (!e?.name || !e.date) return false
      // A multi day event counts if any part of it lands in the window.
      const start = e.date
      const end   = e.dateEnd || e.date
      return start <= last && end >= first
    })
    .sort((a, b) =>
      a.date.localeCompare(b.date) || timeToMinutes(a.time) - timeToMinutes(b.time))
}

// Blank cost is not unknown, it means free. See CLAUDE.md, this bit has bitten
// the project before.
function describeCost(e) {
  const c = (e.cost || '').trim()
  if (!c) return 'Free'
  return c
}

function buildDigest(events, days) {
  const byDay = days.map(d => ({ date: d, day: dayName(d), items: [] }))
  for (const e of events) {
    // dateEnd carries two different meanings in this data and only one of them
    // should spread an event across days. A festival that genuinely runs Friday
    // to Sunday belongs on all three. A weekly series whose organiser typed the
    // last date of the season into dateEnd does NOT: Cherry Creek's Vineyard
    // Jams runs to Oct 24, and expanding that put it on every day of the
    // weekend, so Holly announced a Sunday Vineyard Jams that does not happen
    // while the real Sunday listing is Acoustic Sundays.
    //
    // Nothing in the feed distinguishes the two, so use the span: four days is
    // a long festival, six weeks is a season. Anything longer sits on its start
    // date only. Wrong on a genuinely month-long exhibition, which is the
    // cheaper mistake, because that one is still announced, just once.
    const SPAN_LIMIT = 4
    const rawEnd = e.dateEnd || e.date
    const span = Math.round(
      (new Date(rawEnd + 'T12:00:00Z') - new Date(e.date + 'T12:00:00Z')) / 86400000) + 1
    const end = span > SPAN_LIMIT ? e.date : rawEnd
    for (const slot of byDay) {
      if (e.date <= slot.date && end >= slot.date) slot.items.push(e)
    }
  }

  const lines = []
  for (const slot of byDay) {
    lines.push(`\n${slot.day.toUpperCase()} ${slot.date}`)
    if (!slot.items.length) { lines.push('  (nothing listed)'); continue }
    for (const e of slot.items) {
      const parts = [`  - ${e.name}`]
      parts.push(`    location: ${e.location || 'NOT GIVEN'}`)
      parts.push(`    start time: ${e.time || 'NOT GIVEN'}`)
      if (e.timeEnd) parts.push(`    end time: ${e.timeEnd}`)
      parts.push(`    cost: ${describeCost(e)}`)
      if (e.category) parts.push(`    category: ${e.category}`)
      const desc = (e.description || '').trim().replace(/\s+/g, ' ')
      if (desc) parts.push(`    description: ${desc.slice(0, 400)}`)
      lines.push(parts.join('\n'))
    }
  }
  return lines.join('\n')
}

// ---------------------------------------------------------------- generate

async function generateScript(digest, days) {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) throw new Error('ANTHROPIC_API_KEY not set')
  const persona = readFileSync(join(__dirname, 'holly-persona.md'), 'utf8')
  const client = new Anthropic({ apiKey: key })

  const span = `${dayName(days[0])} ${days[0]} through ${dayName(days[3])} ${days[3]}`

  // max_tokens caps thinking AND response text together, and adaptive thinking
  // is on by default on this model. A tight budget gets eaten by thinking and
  // the response truncates before a single word of script comes back.
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 16000,
    system: persona,
    messages: [{
      role: 'user',
      content:
        `Write this week's AI Holly weekend rundown covering ${span}.\n\n` +
        `Here is every published event in the window, exactly as the website ` +
        `has it. This is your only source. Do not add anything that is not ` +
        `here.\n${digest}\n\n` +
        `Remember: an event showing "start time: NOT GIVEN" must be described ` +
        `without a time. Do not invent one.`,
    }],
  })

  if (msg.stop_reason === 'refusal') {
    throw new Error('Claude declined to write this script. Check the event data for something odd.')
  }
  const text = msg.content.filter(b => b.type === 'text').map(b => b.text).join('').trim()
  if (!text) {
    throw new Error(
      `No text came back (stop_reason: ${msg.stop_reason}, ` +
      `output tokens: ${msg.usage?.output_tokens}). If stop_reason is max_tokens, ` +
      `raise max_tokens - thinking and the response share that budget.`)
  }
  return text
}

// HeyGen reads the script literally, so a word it says wrong is fixed by
// respelling it. Done in code rather than left to the prompt: the model would
// have to remember every rule every week, and a silent regression here ships
// straight into Holly's mouth. See scripts/holly-pronunciation.json.
function applyPronunciation(spoken) {
  const { replacements } = JSON.parse(
    readFileSync(join(__dirname, 'holly-pronunciation.json'), 'utf8'))
  const applied = []
  let out = spoken
  for (const [from, to] of Object.entries(replacements)) {
    // Capture a trailing plural so "rieslings" is fixed too, not just the
    // singular, and the s survives into the respelling.
    const re = new RegExp(`\\b${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(s?)\\b`, 'gi')
    const hits = (out.match(re) || []).length
    if (hits) { out = out.replace(re, (_, plural) => to + plural); applied.push(`${from}->${to} x${hits}`) }
  }
  return { out, applied }
}

function extractVerify(markdown) {
  const body = (/##\s*VERIFY BEFORE POSTING\s*\n([\s\S]*?)(?=\n##\s|\s*$)/
    .exec(markdown) || [])[1]?.trim() || ''
  if (!body || /^nothing flagged\.?$/i.test(body)) return []
  return body.split('\n')
    .map(l => l.replace(/^[-*]\s*/, '').trim())
    .filter(Boolean)
}

function extractSpoken(markdown) {
  const m = /<!--\s*HEYGEN:START\s*-->([\s\S]*?)<!--\s*HEYGEN:END\s*-->/.exec(markdown)
  return m ? m[1].trim() : ''
}

// ---------------------------------------------------------------- output

async function persist(markdown, days) {
  const filename = `holly-scripts/holly-weekend-${days[0]}.md`
  const blob = await put(filename, markdown, {
    access: 'public',
    token: blobToken,
    // Plain text, not text/markdown: iOS downloads a .md instead of showing it,
    // and the whole point of this link is that Daryl reads it on his phone.
    contentType: 'text/plain; charset=utf-8',
    addRandomSuffix: false,
    allowOverwrite: true,
  })
  return blob.url
}

async function notify(message) {
  if (!alertToken) {
    console.warn('ALERT_TOKEN not set, skipping SMS')
    return false
  }
  const res = await fetch(`${siteUrl}/api/internal-alert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: alertToken, message }),
  })
  if (!res.ok) {
    console.error(`internal-alert failed ${res.status}: ${await res.text()}`)
    return false
  }
  return true
}

// ---------------------------------------------------------------- main

async function main() {
  const days = weekendWindow()
  console.log('=== AI Holly weekend script ===')
  console.log(`Window: ${days[0]} (Thu) through ${days[3]} (Sun)`)

  const events = await fetchEvents(days)
  console.log(`Events in window: ${events.length}`)

  if (!events.length) {
    console.log('Nothing published for this window.')
    if (!isDryRun && !noNotify) {
      await notify(
        `AI Holly: no published events for ${days[0]} to ${days[3]}. ` +
        `No script written. Add events at ${siteUrl} if that looks wrong.`)
    }
    process.exit(0)
  }

  const digest = buildDigest(events, days)
  const noTime = events.filter(e => !e.time)
  if (noTime.length) {
    console.log(`Heads up, ${noTime.length} event(s) have no start time: ` +
      noTime.map(e => e.name).join(', '))
  }

  let script = await generateScript(digest, days)
  let spoken = extractSpoken(script)
  if (spoken) {
    const { out, applied } = applyPronunciation(spoken)
    if (applied.length) {
      console.log(`Pronunciation fixes: ${applied.join(', ')}`)
      // Rewrite the block in place so the file the render step reads is the
      // corrected one. The on-screen script and caption keep real spellings.
      script = script.replace(spoken, out)
      spoken = out
    }
  }
  const words = spoken ? spoken.split(/\s+/).length : 0
  const seconds = Math.round(words / 2.7)  // ~2.7 spoken words per second
  if (!spoken) {
    console.warn('WARNING: no HEYGEN:START/END block found in the output. ' +
      'The render step will not be able to read a spoken script.')
  } else {
    console.log(`Spoken script: ${words} words, roughly ${seconds} seconds.`)
  }

  const header =
    `# AI Holly Weekend Script: ${days[0]} to ${days[3]}\n\n` +
    `**Window:** ${dayName(days[0])} through ${dayName(days[3])}\n` +
    `**Source:** ${siteUrl}/api/events, ${events.length} published events\n` +
    `**Generated:** ${new Date().toISOString()}\n` +
    `**Status:** DRAFT, not yet approved\n\n---\n\n`
  const markdown = header + script + '\n'

  if (isDryRun) {
    console.log('\n' + markdown)
    console.log('Dry run, nothing written.')
    process.exit(0)
  }

  // Persist before notifying. A text pointing at a script that was never
  // saved is worse than no text at all.
  let blobUrl = null
  if (blobToken) {
    blobUrl = await persist(markdown, days)
    console.log(`Saved: ${blobUrl}`)
  } else {
    console.warn('BLOB_READ_WRITE_TOKEN not set, skipping blob save')
  }

  const localPath = join(ROOT, 'marketing', `ai-holly-weekend-${days[0]}.md`)
  mkdirSync(join(ROOT, 'marketing'), { recursive: true })
  writeFileSync(localPath, markdown, 'utf8')
  console.log(`Wrote: ${localPath}`)

  if (!noNotify) {
    // The text is the QA artifact, not just a doorbell. Anything Holly might
    // say wrong should be visible without opening the link.
    const flags = extractVerify(script)
    const lines = [
      `AI Holly draft, ${days[0]} to ${days[3]}.`,
      `${events.length} events, ~${seconds}s of script.`,
    ]
    if (flags.length) {
      lines.push(`CHECK ${flags.length}:`)
      for (const f of flags.slice(0, 3)) lines.push(`- ${f.slice(0, 130)}`)
      if (flags.length > 3) lines.push(`- plus ${flags.length - 3} more in the draft`)
    } else {
      lines.push('Nothing flagged.')
    }
    lines.push(blobUrl || 'Saved in the repo, no blob token set.')
    lines.push('Nothing posts until you run the AI Holly Render workflow.')

    const sent = await notify(lines.join('\n'))
    console.log(sent ? 'Texted Daryl.' : 'SMS not sent.')
  }

  console.log('=== done ===')
}

main().catch(err => { console.error(err); process.exit(1) })
