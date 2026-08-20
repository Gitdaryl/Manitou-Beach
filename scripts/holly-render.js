#!/usr/bin/env node
// AI Holly video: render the approved script through HeyGen, or post an
// already-rendered one.
//
// Two modes, deliberately separate so posting never re-renders and never
// double-charges the HeyGen wallet:
//
//   node scripts/holly-render.js            render, save, text Daryl the link
//   node scripts/holly-render.js --post     post the video that already exists
//
// Flags: --week=YYYY-MM-DD  the Thursday, otherwise the next one
//        --dry-run          show what would be sent, call nothing

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { put, list } from '@vercel/blob'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// Confirmed by Daryl 2026-08-19. "Holly on Pontoon" is the AI Holly avatar and
// its default voice is the CLONED Holly. Do not look these up by name: the
// public voice list contains a stock voice also called "Holly"
// (5d05bed2a62c4bf586edd4d657e2454f) and matching on the name picks that one.
const AVATAR_ID = process.env.HEYGEN_AVATAR_ID || '3ff1dbd57555436fb49fd9594a463069'
const VOICE_ID  = process.env.HEYGEN_VOICE_ID  || 'a7d9bb2bd0f34fd5a6bcd4b71db2e39f'

const HEYGEN_CREATE = 'https://api.heygen.com/v3/videos'
const HEYGEN_STATUS = 'https://api.heygen.com/v1/video_status.get'
const FB_API        = 'https://graph.facebook.com/v25.0'
const FB_VIDEO_API  = 'https://graph-video.facebook.com/v25.0'

const heygenKey  = process.env.HEYGEN_API_KEY
const blobToken  = process.env.BLOB_READ_WRITE_TOKEN
const alertToken = process.env.ALERT_TOKEN || process.env.ADMIN_SECRET
const siteUrl    = process.env.SITE_URL || 'https://manitoubeachmichigan.com'
const pageId     = process.env.META_PAGE_ID || process.env.FB_PAGE_ID
const pageToken  = process.env.META_PAGE_ACCESS_TOKEN || process.env.FB_PAGE_ACCESS_TOKEN
const igId       = process.env.META_IG_ACCOUNT_ID || process.env.IG_BUSINESS_ACCOUNT_ID

const isPost   = process.argv.includes('--post')
const isDryRun = process.argv.includes('--dry-run')
const weekArg  = (process.argv.find(a => a.startsWith('--week=')) || '').split('=')[1]

const TZ = 'America/Detroit'
const videoPath = thursday => `holly-weekend/holly-${thursday}.mp4`

// ---------------------------------------------------------------- dates

function nextThursday() {
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
  const dow = new Date(`${today}T12:00:00Z`).getUTCDay()
  const d = new Date(`${today}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + ((4 - dow + 7) % 7))
  return d.toISOString().split('T')[0]
}

// ---------------------------------------------------------------- the draft

function loadDraft(thursday) {
  const path = join(ROOT, 'marketing', `ai-holly-weekend-${thursday}.md`)
  let md
  try {
    md = readFileSync(path, 'utf8')
  } catch {
    throw new Error(
      `No draft at ${path}. Run scripts/holly-weekend-script.js first, or pass ` +
      `--week= the Thursday you actually want.`)
  }

  const spoken = (/<!--\s*HEYGEN:START\s*-->([\s\S]*?)<!--\s*HEYGEN:END\s*-->/
    .exec(md) || [])[1]?.trim()
  if (!spoken) {
    throw new Error(`${path} has no HEYGEN:START/END block. Was it hand-edited?`)
  }

  const caption = (/##\s*CAPTION\s*\n([\s\S]*?)(?=\n##\s|\s*$)/.exec(md) || [])[1]?.trim() || ''

  const verify = (/##\s*VERIFY BEFORE POSTING\s*\n([\s\S]*?)(?=\n##\s|\s*$)/
    .exec(md) || [])[1]?.trim() || ''
  const flags = (!verify || /^nothing flagged\.?$/i.test(verify))
    ? []
    : verify.split('\n').map(l => l.replace(/^[-*]\s*/, '').trim()).filter(Boolean)

  return { path, spoken, caption, flags }
}

// ---------------------------------------------------------------- heygen

async function submitRender(script) {
  const res = await fetch(HEYGEN_CREATE, {
    method: 'POST',
    headers: { 'X-Api-Key': heygenKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'avatar',
      avatar_id: AVATAR_ID,
      engine: { type: 'avatar_v' },
      voice_id: VOICE_ID,
      script,
      // v3 takes aspect_ratio + resolution, NOT a dimension object. Sending
      // `dimension` returns 400 "Extra inputs are not permitted".
      aspect_ratio: '9:16',
      resolution: '1080p',
    }),
  })
  const body = await res.json()
  if (!res.ok || body.error) {
    throw new Error(`HeyGen create failed ${res.status}: ${JSON.stringify(body.error || body)}`)
  }
  const id = body.data?.video_id || body.video_id || body.data?.id
  if (!id) throw new Error(`HeyGen returned no video id: ${JSON.stringify(body).slice(0, 300)}`)
  return id
}

// Renders usually land around two minutes; the slow tail runs longer.
async function waitForRender(videoId) {
  const deadline = Date.now() + 20 * 60 * 1000
  let last = ''
  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, 15000))
    const res = await fetch(`${HEYGEN_STATUS}?video_id=${videoId}`, {
      headers: { 'X-Api-Key': heygenKey },
    })
    const d = (await res.json()).data || {}
    if (d.status !== last) { console.log(`  status: ${d.status}`); last = d.status }
    if (d.status === 'completed') {
      if (!d.video_url) throw new Error('HeyGen said completed but returned no video_url')
      return d.video_url
    }
    if (d.status === 'failed') {
      throw new Error(`HeyGen render failed: ${JSON.stringify(d.error || d)}`)
    }
  }
  throw new Error(`Render still not done after 20 minutes (video_id ${videoId})`)
}

// HeyGen's own URLs expire, so re-host the file. Facebook and Instagram fetch
// the URL themselves and may do it long after we hand it over.
async function mirrorToBlob(heygenUrl, thursday) {
  console.log('Downloading from HeyGen...')
  const res = await fetch(heygenUrl)
  if (!res.ok) throw new Error(`Could not download the render: ${res.status}`)
  const buffer = Buffer.from(await res.arrayBuffer())

  const dir = join(ROOT, 'video-templates', 'holly-weekend', 'renders')
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, `holly-weekend-${thursday}.mp4`), buffer)

  const blob = await put(videoPath(thursday), buffer, {
    access: 'public',
    token: blobToken,
    contentType: 'video/mp4',
    addRandomSuffix: false,
    allowOverwrite: true,
  })
  const mb = (buffer.length / 1024 / 1024).toFixed(1)
  console.log(`Blob URL: ${blob.url} (${mb} MB)`)
  return blob.url
}

async function findExistingVideo(thursday) {
  const { blobs } = await list({ prefix: videoPath(thursday), token: blobToken })
  if (!blobs.length) {
    throw new Error(
      `No rendered video for ${thursday}. The Wednesday job renders it; run ` +
      `this without --post to render one now.`)
  }
  return blobs[0].url
}

// ---------------------------------------------------------------- posting

async function postToFacebook(videoUrl, caption) {
  const res = await fetch(`${FB_VIDEO_API}/${pageId}/videos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file_url: videoUrl, description: caption, access_token: pageToken }),
  })
  const data = await res.json()
  if (data.error) throw new Error(`FB error: ${data.error.message}`)
  return data.id
}

async function postToInstagram(videoUrl, caption) {
  const containerRes = await fetch(`${FB_API}/${igId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      media_type: 'REELS', video_url: videoUrl, caption,
      share_to_feed: 'true', access_token: pageToken,
    }),
  })
  const container = await containerRes.json()
  if (container.error) throw new Error(`IG container error: ${container.error.message}`)

  for (let i = 0; i < 12; i++) {
    await new Promise(r => setTimeout(r, 10000))
    const statusRes = await fetch(
      `${FB_API}/${container.id}?fields=status_code&access_token=${pageToken}`)
    const status = await statusRes.json()
    console.log(`  IG status: ${status.status_code}`)
    if (status.status_code === 'FINISHED') break
    if (status.status_code === 'ERROR') throw new Error('IG media processing failed')
  }

  const publishRes = await fetch(`${FB_API}/${igId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creation_id: container.id, access_token: pageToken }),
  })
  const published = await publishRes.json()
  if (published.error) throw new Error(`IG publish error: ${published.error.message}`)
  return published.id
}

async function notify(message) {
  if (!alertToken) { console.warn('ALERT_TOKEN not set, skipping SMS'); return false }
  const res = await fetch(`${siteUrl}/api/internal-alert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: alertToken, message }),
  })
  if (!res.ok) console.error(`internal-alert failed ${res.status}`)
  return res.ok
}

// ---------------------------------------------------------------- modes

async function doRender(thursday) {
  const { path, spoken, flags } = loadDraft(thursday)
  const words = spoken.split(/\s+/).length
  const seconds = Math.round(words / 2.7)
  console.log(`Draft: ${path}`)
  console.log(`Spoken script: ${words} words, roughly ${seconds} seconds`)

  if (isDryRun) {
    console.log(`\n--- would send to avatar ${AVATAR_ID} / voice ${VOICE_ID} ---`)
    console.log(spoken)
    return
  }

  if (!heygenKey) throw new Error('HEYGEN_API_KEY not set')
  if (!blobToken) throw new Error('BLOB_READ_WRITE_TOKEN not set')

  const videoId = await submitRender(spoken)
  console.log(`Submitted to HeyGen. video_id ${videoId}`)
  const videoUrl = await mirrorToBlob(await waitForRender(videoId), thursday)

  // The text is about the video. Daryl already knows what is on around the
  // lakes; what he needs is the file and anything that might be wrong in it.
  const lines = [`AI Holly video is ready. ${seconds}s, weekend of ${thursday}.`, videoUrl]
  if (flags.length) {
    lines.push(`${flags.length} thing${flags.length === 1 ? '' : 's'} to check before posting:`)
    for (const f of flags.slice(0, 2)) lines.push(`- ${f.slice(0, 120)}`)
    if (flags.length > 2) lines.push(`- plus ${flags.length - 2} more in the script`)
  }
  lines.push('Nothing is posted. Run the AI Holly Post workflow when you are happy.')
  await notify(lines.join('\n'))

  console.log('\nRendered and delivered. Nothing posted.')
}

async function doPost(thursday) {
  const { caption } = loadDraft(thursday)
  const videoUrl = await findExistingVideo(thursday)
  console.log(`Posting ${videoUrl}`)

  if (isDryRun) {
    console.log('\n--- caption ---')
    console.log(caption)
    return
  }

  const results = {}
  const errors = {}

  if (pageId && pageToken) {
    try { results.facebook = await postToFacebook(videoUrl, caption) }
    catch (err) { console.error('Facebook failed:', err.message); errors.facebook = err.message }
  } else console.warn('Facebook credentials missing, skipping')

  if (igId && pageToken) {
    try { results.instagram = await postToInstagram(videoUrl, caption) }
    catch (err) { console.error('Instagram failed:', err.message); errors.instagram = err.message }
  } else console.warn('Instagram credentials missing, skipping')

  await notify(Object.keys(errors).length
    ? `AI Holly ${thursday} posted with problems. Worked: ${Object.keys(results).join(', ') || 'nothing'}. Failed: ${Object.entries(errors).map(([k, v]) => `${k} (${v})`).join('; ')}`
    : `AI Holly ${thursday} is live on ${Object.keys(results).join(' and ')}.`)

  console.log('Results:', results)
  if (Object.keys(errors).length) console.log('Errors:', errors)
  if (Object.keys(errors).length && !Object.keys(results).length) process.exit(1)
}

// ---------------------------------------------------------------- main

async function main() {
  const thursday = weekArg || nextThursday()
  console.log(`=== AI Holly ${isPost ? 'post' : 'render'} ===`)
  console.log(`Weekend starting: ${thursday}`)
  if (isPost) await doPost(thursday)
  else await doRender(thursday)
  console.log('=== done ===')
}

main().catch(err => { console.error(err.message); process.exit(1) })
