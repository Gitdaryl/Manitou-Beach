#!/usr/bin/env node
// Render an approved AI Holly weekend script through HeyGen and post it.
// This is the approval half: nothing here runs on a schedule. Daryl reads the
// draft the Wednesday job texted him, then triggers this by hand on Thursday.
//
// Run: node scripts/holly-render.js
// Flags: --week=YYYY-MM-DD  the Thursday to render, otherwise the next one
//        --dry-run          print the spoken script and caption, call nothing
//        --no-post          render and upload, but skip Facebook and Instagram

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { put } from '@vercel/blob'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// Confirmed by Daryl 2026-08-19. "Holly on Pontoon" is the AI Holly avatar.
// Its default voice is the CLONED Holly, not the same-named stock voice: the
// public voice list also contains a "Holly" (5d05bed2...) that is a HeyGen
// stock voice. Matching on the name picks the wrong one. Match on these IDs.
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

const isDryRun = process.argv.includes('--dry-run')
const noPost   = process.argv.includes('--no-post')
const weekArg  = (process.argv.find(a => a.startsWith('--week=')) || '').split('=')[1]

const TZ = 'America/Detroit'

// ---------------------------------------------------------------- the script

function nextThursday() {
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
  const dow = new Date(`${today}T12:00:00Z`).getUTCDay()
  const d = new Date(`${today}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + ((4 - dow + 7) % 7))
  return d.toISOString().split('T')[0]
}

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

  // Caption runs from its heading to the next one.
  const caption = (/##\s*CAPTION\s*\n([\s\S]*?)(?=\n##\s|\s*$)/.exec(md) || [])[1]?.trim() || ''

  return { path, md, spoken, caption }
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
      dimension: { width: 1080, height: 1920 },
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

// Renders land around two minutes but the slow tail runs longer, so give it
// fifteen. Failing here is cheap; a half-posted Thursday is not.
async function waitForRender(videoId) {
  const deadline = Date.now() + 15 * 60 * 1000
  let last = ''
  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, 15000))
    const res = await fetch(`${HEYGEN_STATUS}?video_id=${videoId}`, {
      headers: { 'X-Api-Key': heygenKey },
    })
    const body = await res.json()
    const d = body.data || {}
    if (d.status !== last) {
      console.log(`  status: ${d.status}`)
      last = d.status
    }
    if (d.status === 'completed') {
      if (!d.video_url) throw new Error('HeyGen said completed but returned no video_url')
      return d.video_url
    }
    if (d.status === 'failed') {
      throw new Error(`HeyGen render failed: ${JSON.stringify(d.error || d)}`)
    }
  }
  throw new Error(`Render still not done after 15 minutes (video_id ${videoId})`)
}

// ---------------------------------------------------------------- output

async function mirrorToBlob(videoUrl, thursday) {
  // HeyGen's URLs expire. Pull the file down and re-host it, because Facebook
  // and Instagram fetch the URL themselves and may do it minutes later.
  console.log('Downloading from HeyGen...')
  const res = await fetch(videoUrl)
  if (!res.ok) throw new Error(`Could not download the render: ${res.status}`)
  const buffer = Buffer.from(await res.arrayBuffer())

  const localDir = join(ROOT, 'video-templates', 'holly-weekend', 'renders')
  mkdirSync(localDir, { recursive: true })
  const localPath = join(localDir, `holly-weekend-${thursday}.mp4`)
  writeFileSync(localPath, buffer)
  console.log(`Saved locally: ${localPath}`)

  const blob = await put(`holly-weekend/holly-${thursday}.mp4`, buffer, {
    access: 'public',
    token: blobToken,
    contentType: 'video/mp4',
    addRandomSuffix: false,
    allowOverwrite: true,
  })
  console.log(`Blob URL: ${blob.url}`)
  return blob.url
}

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
      media_type: 'REELS',
      video_url: videoUrl,
      caption,
      share_to_feed: 'true',
      access_token: pageToken,
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
  if (!alertToken) return false
  const res = await fetch(`${siteUrl}/api/internal-alert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: alertToken, message }),
  })
  return res.ok
}

// ---------------------------------------------------------------- main

async function main() {
  const thursday = weekArg || nextThursday()
  console.log('=== AI Holly render ===')
  console.log(`Weekend starting: ${thursday}`)

  const { path, spoken, caption } = loadDraft(thursday)
  console.log(`Draft: ${path}`)
  console.log(`Spoken script: ${spoken.split(/\s+/).length} words`)

  if (isDryRun) {
    console.log(`\n--- would send to avatar ${AVATAR_ID} / voice ${VOICE_ID} ---`)
    console.log(spoken)
    console.log('\n--- caption ---')
    console.log(caption)
    process.exit(0)
  }

  if (!heygenKey) throw new Error('HEYGEN_API_KEY not set')
  if (!blobToken) throw new Error('BLOB_READ_WRITE_TOKEN not set')

  const videoId = await submitRender(spoken)
  console.log(`Submitted. video_id ${videoId}`)
  const heygenUrl = await waitForRender(videoId)
  const videoUrl = await mirrorToBlob(heygenUrl, thursday)

  if (noPost) {
    console.log('Rendered but not posted, as asked.')
    await notify(`AI Holly video for ${thursday} is rendered, not posted: ${videoUrl}`)
    process.exit(0)
  }

  const results = {}
  const errors = {}

  if (pageId && pageToken) {
    try { results.facebook = await postToFacebook(videoUrl, caption) }
    catch (err) { console.error('Facebook failed:', err.message); errors.facebook = err.message }
  } else {
    console.warn('Facebook credentials missing, skipping')
  }

  if (igId && pageToken) {
    try { results.instagram = await postToInstagram(videoUrl, caption) }
    catch (err) { console.error('Instagram failed:', err.message); errors.instagram = err.message }
  } else {
    console.warn('Instagram credentials missing, skipping')
  }

  const summary = Object.keys(errors).length
    ? `AI Holly ${thursday} posted with problems. Worked: ${Object.keys(results).join(', ') || 'nothing'}. Failed: ${Object.entries(errors).map(([k, v]) => `${k} (${v})`).join('; ')}. Video: ${videoUrl}`
    : `AI Holly ${thursday} is live on ${Object.keys(results).join(' and ')}. ${videoUrl}`
  await notify(summary)

  console.log('\n=== done ===')
  console.log('Results:', results)
  if (Object.keys(errors).length) console.log('Errors:', errors)
  process.exit(Object.keys(errors).length && !Object.keys(results).length ? 1 : 0)
}

main().catch(err => { console.error(err.message); process.exit(1) })
