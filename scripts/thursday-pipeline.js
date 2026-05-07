#!/usr/bin/env node
// Thursday roundup pipeline: Notion events → Hyperframes render → Vercel Blob upload → FB + IG post
// Run: node scripts/thursday-pipeline.js
// Flags: --preview  (skip posting, log caption + image URL)
//        --dry-run  (skip render + post, just log what would happen)

import { execSync } from 'child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { put } from '@vercel/blob'
import { generateRoundupHTML, buildCaption, getWeeklyBgImage } from './generate-roundup-html.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT      = join(__dirname, '..')
const TEMPLATE_DIR = join(ROOT, 'video-templates', 'thursday-slideshow')
const RENDERS_DIR  = join(TEMPLATE_DIR, 'renders')

const FB_API = 'https://graph.facebook.com/v25.0'
const FB_VIDEO_API = 'https://graph-video.facebook.com/v25.0'

const NOTION_HEADERS = {
  Authorization: `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
}

const siteUrl    = process.env.SITE_URL    || 'https://manitoubeachmichigan.com'
const pageId     = process.env.META_PAGE_ID      || process.env.FB_PAGE_ID
const pageToken  = process.env.META_PAGE_ACCESS_TOKEN || process.env.FB_PAGE_ACCESS_TOKEN
const igId       = process.env.META_IG_ACCOUNT_ID || process.env.IG_BUSINESS_ACCOUNT_ID
const blobToken  = process.env.BLOB_READ_WRITE_TOKEN
const isPreview  = process.argv.includes('--preview')
const isDryRun   = process.argv.includes('--dry-run')

function getWeekendDates() {
  const now = new Date()
  const day = now.getDay()
  const diff = d => { const dt = new Date(now); dt.setDate(now.getDate() + d); return dt.toISOString().split('T')[0] }
  return {
    friday:   diff(5 - day),
    saturday: diff(6 - day),
    sunday:   diff(7 - day),
  }
}

async function fetchEvents(dates) {
  const { friday, saturday, sunday } = dates
  const res = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_DB_EVENTS}/query`, {
    method: 'POST',
    headers: NOTION_HEADERS,
    body: JSON.stringify({
      filter: {
        and: [
          { or: [
            { property: 'Status', status: { equals: 'Approved' } },
            { property: 'Status', status: { equals: 'Published' } },
          ]},
          { or: [
            { property: 'Event date', date: { equals: friday } },
            { property: 'Event date', date: { equals: saturday } },
            { property: 'Event date', date: { equals: sunday } },
          ]},
        ],
      },
      sorts: [{ property: 'Event date', direction: 'ascending' }],
    }),
  })
  if (!res.ok) throw new Error(`Notion error ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return (data.results || []).map(page => {
    const p = page.properties
    const date = p['Event date']?.date?.start || ''
    return {
      name:    p['Event Name']?.title?.[0]?.text?.content || '',
      date,
      time:    p['Time']?.rich_text?.[0]?.text?.content || '',
      timeEnd: p['Time End']?.rich_text?.[0]?.text?.content || '',
      location: p['Location']?.rich_text?.[0]?.text?.content || '',
    }
  }).filter(e => e.name)
}

function renderVideo(html) {
  mkdirSync(RENDERS_DIR, { recursive: true })
  const htmlPath = join(TEMPLATE_DIR, 'index.html')
  writeFileSync(htmlPath, html, 'utf8')
  console.log('Rendering video...')
  execSync('npx --yes hyperframes@0.5.3 render', {
    cwd: TEMPLATE_DIR,
    stdio: 'inherit',
    env: { ...process.env },
  })
  // Find the most recently created MP4
  const files = readdirSync(RENDERS_DIR)
    .filter(f => f.endsWith('.mp4'))
    .map(f => ({ name: f, mtime: existsSync(join(RENDERS_DIR, f)) ? readFileSync(join(RENDERS_DIR, f)).length : 0 }))
  // Sort by filename desc (timestamps are embedded: name_YYYY-MM-DD_HH-MM-SS.mp4)
  files.sort((a, b) => b.name.localeCompare(a.name))
  if (!files.length) throw new Error('No MP4 found in renders/ after render step')
  return join(RENDERS_DIR, files[0].name)
}

async function uploadToBlob(mp4Path) {
  console.log(`Uploading ${mp4Path} to Vercel Blob...`)
  const today = new Date().toISOString().split('T')[0]
  const filename = `thursday-roundup/roundup-${today}.mp4`
  const buffer = readFileSync(mp4Path)
  const blob = await put(filename, buffer, {
    access: 'public',
    token: blobToken,
    contentType: 'video/mp4',
    addRandomSuffix: false,
  })
  console.log(`Blob URL: ${blob.url}`)
  return blob.url
}

async function writeBlobMarker(dates) {
  try {
    const today = new Date().toISOString().split('T')[0]
    await put(`thursday-post-${today}.json`,
      JSON.stringify({ postedAt: new Date().toISOString(), weekend: dates }), {
        access: 'public',
        token: blobToken,
        contentType: 'application/json',
        addRandomSuffix: false,
      })
    console.log(`Blob marker written for ${today}`)
  } catch (err) {
    console.warn('Could not write blob marker:', err.message)
  }
}

async function postToFacebook(videoUrl, caption) {
  console.log('Posting to Facebook...')
  const res = await fetch(`${FB_VIDEO_API}/${pageId}/videos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file_url: videoUrl, description: caption, access_token: pageToken }),
  })
  const data = await res.json()
  if (data.error) throw new Error(`FB error: ${data.error.message}`)
  console.log(`Facebook post ID: ${data.id}`)
  return data.id
}

async function postToInstagram(videoUrl, caption) {
  console.log('Posting to Instagram...')
  // Step 1: create container
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
  const containerData = await containerRes.json()
  if (containerData.error) throw new Error(`IG container error: ${containerData.error.message}`)
  const creationId = containerData.id

  // Step 2: poll until ready (IG processing takes 10-60s)
  console.log(`IG container ${creationId} – waiting for processing...`)
  for (let attempt = 0; attempt < 12; attempt++) {
    await new Promise(r => setTimeout(r, 10000))
    const statusRes = await fetch(
      `${FB_API}/${creationId}?fields=status_code&access_token=${pageToken}`
    )
    const statusData = await statusRes.json()
    console.log(`  IG status: ${statusData.status_code}`)
    if (statusData.status_code === 'FINISHED') break
    if (statusData.status_code === 'ERROR') throw new Error('IG media processing failed')
  }

  // Step 3: publish
  const publishRes = await fetch(`${FB_API}/${igId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creation_id: creationId, access_token: pageToken }),
  })
  const publishData = await publishRes.json()
  if (publishData.error) throw new Error(`IG publish error: ${publishData.error.message}`)
  console.log(`Instagram Reel ID: ${publishData.id}`)
  return publishData.id
}

async function main() {
  console.log('=== Thursday Roundup Pipeline ===')
  console.log(`Mode: ${isDryRun ? 'DRY RUN' : isPreview ? 'PREVIEW' : 'LIVE'}`)

  const dates = getWeekendDates()
  console.log(`Weekend: Fri ${dates.friday} / Sat ${dates.saturday} / Sun ${dates.sunday}`)

  // Fetch events
  let events
  try {
    events = await fetchEvents(dates)
  } catch (err) {
    console.error('Notion fetch failed:', err.message)
    process.exit(1)
  }

  if (!events.length) {
    console.log('No approved events this weekend – skipping.')
    process.exit(0)
  }
  console.log(`Found ${events.length} events`)

  const caption = buildCaption(events, dates, siteUrl)
  console.log('\n── Caption preview ──')
  console.log(caption)
  console.log('─────────────────────\n')

  if (isDryRun) {
    console.log('Dry run complete.')
    process.exit(0)
  }

  // Generate + render
  const html = generateRoundupHTML(events, dates, siteUrl, getWeeklyBgImage())
  const mp4Path = renderVideo(html)
  console.log(`Rendered: ${mp4Path}`)

  if (isPreview) {
    console.log('Preview mode – skipping upload + post.')
    process.exit(0)
  }

  // Upload
  if (!blobToken) {
    console.error('BLOB_READ_WRITE_TOKEN not set – cannot upload')
    process.exit(1)
  }
  const videoUrl = await uploadToBlob(mp4Path)

  // Post
  const results = {}
  const errors  = {}

  if (pageId && pageToken) {
    try {
      results.facebook = await postToFacebook(videoUrl, caption)
    } catch (err) {
      console.error('Facebook failed:', err.message)
      errors.facebook = err.message
    }
  } else {
    console.warn('Facebook credentials missing – skipping FB post')
  }

  if (igId && pageToken) {
    try {
      results.instagram = await postToInstagram(videoUrl, caption)
    } catch (err) {
      console.error('Instagram failed:', err.message)
      errors.instagram = err.message
    }
  } else {
    console.warn('Instagram credentials missing – skipping IG post')
  }

  await writeBlobMarker(dates)

  console.log('\n=== Pipeline complete ===')
  console.log('Results:', results)
  if (Object.keys(errors).length) console.log('Errors:', errors)
  process.exit(Object.keys(errors).length && !Object.keys(results).length ? 1 : 0)
}

main().catch(err => { console.error(err); process.exit(1) })
