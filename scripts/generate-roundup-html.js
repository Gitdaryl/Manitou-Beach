// Generates a 9:16 Hyperframes-compatible HTML slideshow for the Thursday weekend roundup.
// Full-bleed BG, frosted glass header with MB icon + yeti-celebrates mascot, vertically distributed cards.

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function friendlyDate(iso) {
  if (!iso) return ''
  const [, m, d] = iso.split('-')
  return `${MONTHS[parseInt(m, 10) - 1]} ${parseInt(d, 10)}`
}

const DAY_COLOR = { friday: '#7A8E72', saturday: '#5B7E95', sunday: '#D4845A' }
const DAY_LABEL = { friday: 'FRIDAY', saturday: 'SATURDAY', sunday: 'SUNDAY' }

function escapeHTML(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function extractVenue(location) {
  if (!location) return ''
  let v = location.split(',')[0]
  v = v.replace(/\s*-\s*\d.*$/, '')
  v = v.replace(/\s*[—–].*$/, '')
  v = v.replace(/\s*\([^)]*\)\s*$/, '')
  return v.trim()
}

function formatTime(time, timeEnd) {
  const t  = time?.replace(/^[-–]/, '').trim()
  const te = timeEnd?.replace(/^[-–]/, '').trim()
  if (!t && !te) return ''
  if (t && te) return `${t} – ${te}`
  return t || te
}

export function buildCaption(events, dates, siteUrl) {
  const total = events.length
  const byDay = { friday: [], saturday: [], sunday: [] }
  events.forEach(e => {
    const day = e.date === dates.friday ? 'friday' : e.date === dates.saturday ? 'saturday' : 'sunday'
    byDay[day].push(e)
  })

  const lines = [
    `${total} thing${total !== 1 ? 's' : ''} happening at Manitou Beach this weekend. Pick your adventure.`,
    '',
  ]

  for (const day of ['friday', 'saturday', 'sunday']) {
    const dayEvents = byDay[day]
    if (!dayEvents.length) continue
    lines.push(`${DAY_LABEL[day].charAt(0) + DAY_LABEL[day].slice(1).toLowerCase()}, ${friendlyDate(dates[day])}:`)
    for (const e of dayEvents) {
      const venue    = extractVenue(e.location)
      const time     = formatTime(e.time, e.timeEnd)
      const showVenu = venue && !e.name.toLowerCase().includes(venue.toLowerCase())
      const parts    = [showVenu ? venue : null, time].filter(Boolean)
      lines.push(`  ${e.name}${parts.length ? ' - ' + parts.join(', ') : ''}`)
    }
    lines.push('')
  }

  lines.push(`Full details + food truck locator: ${siteUrl}/events`)
  lines.push('')
  lines.push(`Your event not here? List it free: ${siteUrl}/events`)
  lines.push('')
  lines.push('#ManitouBeachMI #DevilsLakeMI #WeekendPlans #MichiganEvents #LakeLife #IrishHills')
  return lines.join('\n')
}

// Frosted glass card – dark tinted glass over the BG image
const GLASS = `background:rgba(10,18,24,0.62);backdrop-filter:blur(18px) saturate(1.2);-webkit-backdrop-filter:blur(18px);border:1px solid rgba(250,246,239,0.14);border-radius:20px;`

// Header height constant – everything below references this
const HDR = 260
// Top safe-zone offset – keeps header clear of phone notch/status bar
const TOP_PAD = 60

const BG_IMAGES = [
  'assets/bg.jpg',
  'assets/bg2.jpg',
  'assets/bg3.jpg',
  'assets/bg4.jpg',
]

export function getWeeklyBgImage() {
  const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000))
  return BG_IMAGES[weekNum % BG_IMAGES.length]
}

export function generateRoundupHTML(events, dates, siteUrl, bgImage = 'assets/bg.jpg') {
  const byDay = { friday: [], saturday: [], sunday: [] }
  events.forEach(e => {
    const day = e.date === dates.friday ? 'friday' : e.date === dates.saturday ? 'saturday' : 'sunday'
    byDay[day].push(e)
  })

  const slideGroups = []
  for (const day of ['friday', 'saturday', 'sunday']) {
    const dayEvents = byDay[day]
    if (!dayEvents.length) continue
    for (let i = 0; i < dayEvents.length; i += 3) {
      slideGroups.push({
        day,
        color:  DAY_COLOR[day],
        label:  `${DAY_LABEL[day]} · ${friendlyDate(dates[day])}`,
        events: dayEvents.slice(i, i + 3),
      })
    }
  }

  const activeDays = ['friday', 'saturday', 'sunday'].filter(d => byDay[d].length)
  const first      = friendlyDate(dates[activeDays[0]])
  const last       = friendlyDate(dates[activeDays[activeDays.length - 1]])
  const month      = first.split(' ')[0].toUpperCase()
  const d1         = first.split(' ')[1]
  const d2         = last.split(' ')[1]
  const dateBadge  = d1 === d2 ? `${month} ${d1}` : `${month} ${d1}-${d2}`

  // Timing
  const BRAND_IN    = 0.8
  const INTRO_START = 1.0
  const INTRO_DUR   = 2.5
  const SLIDE_DUR   = 3.5
  const FADE        = 0.4
  const CTA_DUR     = 4.0

  const slideStarts = slideGroups.map((_, i) =>
    INTRO_START + INTRO_DUR + FADE * (i + 1) + SLIDE_DUR * i
  )
  const ctaStart      = slideStarts.length > 0
    ? slideStarts[slideStarts.length - 1] + SLIDE_DUR + FADE
    : INTRO_START + INTRO_DUR + FADE
  const totalDuration = Math.ceil(ctaStart + CTA_DUR + 0.5)

  let tk = -1
  const T = () => ++tk
  const siteHost = siteUrl.replace(/https?:\/\//, '')

  // ── BG layers ──────────────────────────────────────────────────────────────
  const bgHTML = `
  <!-- Full-bleed background image -->
  <div id="bg-img" class="clip"
    data-start="0" data-duration="${totalDuration}" data-track-index="${T()}"
    style="position:absolute;top:0;left:0;width:1080px;height:1920px;overflow:hidden;opacity:1;">
    <img src="${bgImage}" style="width:1080px;height:1920px;object-fit:cover;object-position:center 40%;" alt=""/>
  </div>

  <!-- Dark gradient overlay: darker at top + bottom, lighter in middle -->
  <div id="bg-overlay" class="clip"
    data-start="0" data-duration="${totalDuration}" data-track-index="${T()}"
    style="position:absolute;top:0;left:0;width:1080px;height:1920px;
    background:linear-gradient(180deg,rgba(10,18,24,0.0) 0%,rgba(10,18,24,0.42) 30%,rgba(10,18,24,0.45) 70%,rgba(10,18,24,0.72) 100%);
    opacity:1;"></div>`

  // ── Header bar (frosted glass, full-width) ─────────────────────────────────
  // Contains: left accent, MB icon, brand text, date badge
  const headerHTML = `
  <!-- Header bar -->
  <div id="header-bar" class="clip"
    data-start="0" data-duration="${totalDuration}" data-track-index="${T()}"
    style="position:absolute;top:${TOP_PAD}px;left:0;right:0;height:${HDR}px;
    background:rgba(10,18,24,0.72);backdrop-filter:blur(24px) saturate(1.3);-webkit-backdrop-filter:blur(24px);
    border-bottom:1px solid rgba(250,246,239,0.12);opacity:0;">

    <!-- Left accent bar -->
    <div style="position:absolute;left:0;top:0;width:6px;height:100%;
      background:linear-gradient(180deg,#5B7E95 0%,#D4845A 60%,#7A8E72 100%);"></div>

    <!-- MB Lighthouse icon -->
    <img src="assets/mb-icon.png"
      style="position:absolute;left:28px;top:50%;transform:translateY(-50%);
      width:96px;height:96px;border-radius:50%;object-fit:cover;
      border:2px solid rgba(250,246,239,0.25);box-shadow:0 4px 20px rgba(0,0,0,0.4);"/>

    <!-- Brand text: stacked -->
    <div style="position:absolute;left:148px;top:50%;transform:translateY(-50%);">
      <div style="font-family:'Libre Franklin',sans-serif;font-size:50px;font-weight:800;
      color:#FAF6EF;line-height:1;letter-spacing:1px;
      text-shadow:0 2px 12px rgba(0,0,0,0.5);">MANITOU BEACH</div>
      <div style="font-family:'Libre Franklin',sans-serif;font-size:42px;font-weight:700;
      color:#D4845A;line-height:1;letter-spacing:4px;margin-top:6px;
      text-shadow:0 2px 12px rgba(0,0,0,0.4);">MICHIGAN</div>
    </div>

    <!-- Date badge -->
    <div style="position:absolute;top:50%;right:40px;transform:translateY(-50%);
      background:rgba(212,132,90,0.92);border-radius:28px;padding:16px 32px;
      box-shadow:0 4px 20px rgba(212,132,90,0.45);">
      <span style="font-family:'Libre Franklin',sans-serif;font-size:30px;font-weight:700;
      color:#FAF6EF;letter-spacing:2px;">${escapeHTML(dateBadge)}</span>
    </div>
  </div>

  <!-- Header bottom divider line -->
  <div id="header-div" class="clip"
    data-start="0" data-duration="${totalDuration}" data-track-index="${T()}"
    style="position:absolute;top:${TOP_PAD + HDR}px;left:20px;right:20px;height:1px;
    background:linear-gradient(90deg,transparent,rgba(91,126,149,0.5),rgba(91,126,149,0.2),transparent);
    opacity:0;transform-origin:left;transform:scaleX(0);"></div>

  `

  // ── Footer bar ─────────────────────────────────────────────────────────────
  const footerHTML = `
  <!-- Footer URL bar -->
  <div id="footer-bar" class="clip"
    data-start="0" data-duration="${totalDuration}" data-track-index="${T()}"
    style="position:absolute;bottom:0;left:0;right:0;height:110px;
    background:rgba(10,18,24,0.68);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
    border-top:1px solid rgba(250,246,239,0.1);
    display:flex;align-items:center;justify-content:center;opacity:0;">
    <span style="font-family:'Libre Franklin',sans-serif;font-size:26px;font-weight:700;
    color:rgba(250,246,239,0.65);letter-spacing:1px;">
      ${escapeHTML(siteHost)}<span style="color:#D4845A;">/events</span>
    </span>
  </div>`

  // ── Intro slide ────────────────────────────────────────────────────────────
  const introHTML = `
  <!-- Intro: THIS WEEKEND. centered in content area -->
  <div id="slide-intro" class="clip"
    data-start="0" data-duration="${totalDuration}" data-track-index="${T()}"
    style="position:absolute;top:${TOP_PAD + HDR}px;left:54px;right:54px;bottom:110px;
    display:flex;flex-direction:column;justify-content:center;opacity:0;">

    <div style="font-family:'Libre Baskerville',serif;font-size:185px;font-weight:700;
    color:#FAF6EF;line-height:0.86;letter-spacing:-6px;
    text-shadow:0 6px 32px rgba(0,0,0,0.55);">THIS</div>

    <div style="font-family:'Libre Baskerville',serif;font-size:185px;font-weight:700;
    font-style:italic;color:#D4845A;line-height:0.86;letter-spacing:-6px;margin-top:18px;
    text-shadow:0 6px 32px rgba(0,0,0,0.4);">WEEKEND.</div>

    <div style="margin-top:64px;display:flex;align-items:center;gap:20px;">
      <div style="width:52px;height:2px;background:#5B7E95;flex-shrink:0;"></div>
      <span style="font-family:'Libre Franklin',sans-serif;font-size:30px;font-weight:600;
      color:rgba(250,246,239,0.75);letter-spacing:4px;text-transform:uppercase;
      text-shadow:0 2px 10px rgba(0,0,0,0.5);">${events.length} THINGS HAPPENING</span>
    </div>
  </div>`

  // ── Content slides ─────────────────────────────────────────────────────────
  const contentSlidesHTML = slideGroups.map((group, idx) => {
    return `
  <!-- Content slide ${idx}: ${group.label} -->
  <div id="slide-${idx}" class="clip"
    data-start="0" data-duration="${totalDuration}" data-track-index="${T()}"
    style="position:absolute;top:${TOP_PAD + HDR}px;left:54px;right:54px;bottom:110px;
    display:flex;flex-direction:column;opacity:0;">

    <!-- Day label (big, prominent) -->
    <div style="flex-shrink:0;padding-top:48px;padding-bottom:24px;">
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:18px;">
        <div style="width:12px;height:12px;border-radius:50%;background:${group.color};
          box-shadow:0 0 12px ${group.color}88;flex-shrink:0;"></div>
        <span style="font-family:'Libre Franklin',sans-serif;font-size:32px;font-weight:800;
        letter-spacing:5px;text-transform:uppercase;color:${group.color};
        text-shadow:0 2px 10px rgba(0,0,0,0.6);">${escapeHTML(group.label)}</span>
      </div>
      <div style="height:1.5px;
        background:linear-gradient(90deg,${group.color}cc,${group.color}44,transparent);"></div>
    </div>

    <!-- Event cards: flex fills remaining height with even distribution -->
    <div style="flex:1;display:flex;flex-direction:column;justify-content:space-evenly;padding-bottom:16px;">
${group.events.map(e => {
  const venue = extractVenue(e.location)
  const time  = formatTime(e.time, e.timeEnd)
  const showVenue = venue && !e.name.toLowerCase().includes(venue.toLowerCase())
  const sub   = [showVenue ? venue : null, time].filter(Boolean).join(' · ')
  return `      <div style="${GLASS}padding:30px 36px;">
        <div style="font-family:'Libre Baskerville',serif;font-size:52px;font-weight:700;
        color:#FAF6EF;line-height:1.15;${sub ? 'margin-bottom:12px;' : ''}">${escapeHTML(e.name)}</div>
        ${sub ? `<div style="font-family:'Libre Franklin',sans-serif;font-size:26px;font-weight:300;
        color:rgba(250,246,239,0.65);">${escapeHTML(sub)}</div>` : ''}
      </div>`
}).join('\n')}
    </div>
  </div>`
  }).join('')

  // ── CTA slide ──────────────────────────────────────────────────────────────
  // Same structure as event slides: day-label-style header + space-evenly cards
  const ctaHTML = `
  <!-- CTA slide -->
  <div id="slide-cta" class="clip"
    data-start="0" data-duration="${totalDuration}" data-track-index="${T()}"
    style="position:absolute;top:${TOP_PAD + HDR}px;left:54px;right:54px;bottom:110px;
    display:flex;flex-direction:column;opacity:0;">

    <!-- Header row (mirrors day-label style) -->
    <div style="flex-shrink:0;padding-top:48px;padding-bottom:24px;">
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:18px;">
        <div style="width:12px;height:12px;border-radius:50%;background:#D4845A;
          box-shadow:0 0 14px rgba(212,132,90,0.7);flex-shrink:0;"></div>
        <span style="font-family:'Libre Franklin',sans-serif;font-size:32px;font-weight:800;
        letter-spacing:5px;text-transform:uppercase;color:#D4845A;
        text-shadow:0 2px 10px rgba(0,0,0,0.6);">SEE EVERYTHING HAPPENING</span>
      </div>
      <div style="height:1.5px;
        background:linear-gradient(90deg,#D4845Acc,#D4845A44,transparent);"></div>
    </div>

    <!-- 3 cards distributed across remaining height -->
    <div style="flex:1;display:flex;flex-direction:column;justify-content:space-evenly;padding-bottom:16px;">

      <!-- Count summary card -->
      <div style="${GLASS}padding:30px 36px;">
        <div style="font-family:'Libre Franklin',sans-serif;font-size:42px;font-weight:800;
        color:#FAF6EF;line-height:1.1;">${events.length} things happening</div>
        <div style="font-family:'Libre Baskerville',serif;font-size:34px;font-weight:400;
        font-style:italic;color:rgba(250,246,239,0.6);margin-top:6px;">this weekend at Manitou Beach</div>
      </div>

      <!-- URL card -->
      <div style="${GLASS}padding:36px 40px;">
        <div style="font-family:'Libre Baskerville',serif;font-size:38px;font-weight:700;
        color:#FAF6EF;line-height:1.15;white-space:nowrap;">
          ${escapeHTML(siteHost)}<span style="color:#D4845A;">/events</span>
        </div>
        <div style="font-family:'Libre Franklin',sans-serif;font-size:26px;font-weight:300;
        color:rgba(250,246,239,0.55);margin-top:10px;">Food truck locator + full event details</div>
      </div>

      <!-- List-it-free pill -->
      <div style="${GLASS}padding:28px 34px;display:flex;align-items:center;gap:18px;">
        <div style="width:10px;height:10px;border-radius:50%;background:#5B7E95;
          box-shadow:0 0 12px #5B7E9588;flex-shrink:0;"></div>
        <span style="font-family:'Libre Franklin',sans-serif;font-size:28px;font-weight:400;
        color:rgba(250,246,239,0.75);">Your event not here? List it free.</span>
      </div>
    </div>
  </div>`

  // ── GSAP timeline ──────────────────────────────────────────────────────────
  const timelineJS = `
window.__timelines = window.__timelines || {};
const tl = gsap.timeline({ paused: true });

// Header fades in (no position transform to avoid keyframe jump artifacts)
tl.to("#header-bar",  { opacity: 1, duration: 0.65, ease: "power2.out" }, 0.2);
tl.to("#header-div",  { opacity: 1, scaleX: 1, duration: 0.55, ease: "power2.out" }, 0.7);

// Footer bar slides up from bottom (fromTo avoids t=0 set() flicker)
tl.fromTo("#footer-bar", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" }, ${BRAND_IN});

// Intro slide
tl.fromTo("#slide-intro", { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.75, ease: "power3.out" }, ${INTRO_START});
tl.to("#slide-intro",  { opacity: 0, y: -30, duration: ${FADE}, ease: "power2.in" }, ${(INTRO_START + INTRO_DUR).toFixed(2)});

${slideGroups.map((group, i) => {
  const start = slideStarts[i]
  const end   = start + SLIDE_DUR
  return `// ${group.label}
tl.fromTo("#slide-${i}", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.65, ease: "power3.out" }, ${start.toFixed(2)});
tl.to("#slide-${i}",  { opacity: 0, y: -25, duration: ${FADE}, ease: "power2.in" }, ${end.toFixed(2)});`
}).join('\n')}

// CTA
tl.fromTo("#slide-cta", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.65, ease: "back.out(1.4)" }, ${ctaStart.toFixed(2)});
tl.to("#slide-cta",  { scale: 1.012, duration: 1.4, ease: "sine.inOut", yoyo: true, repeat: 1 }, ${(ctaStart + 0.9).toFixed(2)});

window.__timelines["main"] = tl;`

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=1080, height=1920"/>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Libre+Franklin:wght@300;400;600;700;800&display=swap" rel="stylesheet"/>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 1080px; height: 1920px; overflow: hidden; background: #0A1218; }
    .clip { visibility: hidden; }
  </style>
</head>
<body>
<div id="root"
  data-composition-id="main"
  data-start="0"
  data-duration="${totalDuration}"
  data-width="1080"
  data-height="1920">
${bgHTML}
${headerHTML}
${footerHTML}
${introHTML}
${contentSlidesHTML}
${ctaHTML}
</div>
<script>
${timelineJS}
</script>
</body>
</html>`
}
