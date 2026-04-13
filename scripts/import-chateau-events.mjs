/**
 * Batch import Chateau Aeronautique Winery 2026 Tribute Band schedule
 * into the Manitou Beach Events Notion database.
 */

const NOTION_TOKEN = process.env.NOTION_TOKEN_EVENTS;
const EVENTS_DB = process.env.NOTION_DB_EVENTS || '30d8c729eb5980eab54ac5ad67358731';
const API_URL = 'https://api.notion.com/v1/pages';

const LOCATION = 'Chateau Aeronautique Winery, 12000 Pentecost Hwy, Onsted MI';
const PHONE = '(517) 446-4052';

// Events from the 2026 schedule image — starting from upcoming dates (today is 2026-03-29)
// * = Not a Tribute Band (original act / variety show)
const schedule = [
  // April
  ['2026-04-03', 'Mötley Crüe'],
  ['2026-04-04', 'HairMania', true],
  ['2026-04-10', 'Dueling Pianos', true],
  ['2026-04-11', 'Led Zeppelin'],
  ['2026-04-17', 'Boston'],
  ['2026-04-18', 'Ozzy Osbourne'],
  ['2026-04-24', 'Metallica'],
  ['2026-04-25', 'Stevie Nicks'],
  // May
  ['2026-05-01', 'Coldplay | STP'],
  ['2026-05-02', 'Van Halen'],
  ['2026-05-08', 'Girls Night Out', true],
  ['2026-05-09', 'Your Generation', true],
  ['2026-05-15', 'AC/DC'],
  ['2026-05-16', 'Eagles'],
  ['2026-05-22', 'Blondie'],
  ['2026-05-23', 'Eric Clapton'],
  ['2026-05-29', 'Sponge', true],
  ['2026-05-30', 'CCR'],
  // June
  ['2026-06-05', 'Complete Unknowns', true],
  ['2026-06-06', 'Bob Seger'],
  ['2026-06-12', 'The 1985', true],
  ['2026-06-13', 'Bee Gees'],
  ['2026-06-19', 'Jimi Hendrix'],
  ['2026-06-20', 'Guns N\' Roses'],
  ['2026-06-26', 'Sting | Police'],
  ['2026-06-27', 'Elton John'],
  // July
  ['2026-07-03', 'J. Geils'],
  ['2026-07-04', 'Aerosmith'],
  ['2026-07-10', 'Allman Brothers'],
  ['2026-07-11', 'The Rolling Stones'],
  ['2026-07-17', 'Steely Dan'],
  ['2026-07-18', 'Fleetwood Mac'],
  ['2026-07-24', 'Def Leppard'],
  ['2026-07-25', 'Madonna'],
  ['2026-07-31', 'Journey'],
  // August
  ['2026-08-01', 'Beatles'],
  ['2026-08-07', 'Bon Jovi'],
  ['2026-08-08', 'HairMania', true],
  ['2026-08-14', 'Jimmy Buffett'],
  ['2026-08-15', 'Pink Floyd'],
  ['2026-08-21', 'Led Zeppelin'],
  ['2026-08-22', 'ELO'],
  ['2026-08-28', 'Foreigner'],
  ['2026-08-29', 'Dueling Pianos', true],
  // September
  ['2026-09-04', 'Your Generation', true],
  ['2026-09-05', 'Bad Company'],
  ['2026-09-11', 'Rush'],
  // 9/12 appears blank in schedule
  ['2026-09-18', 'Neil Young'],
  ['2026-09-19', 'CCR'],
  ['2026-09-25', 'ZZ Top'],
  ['2026-09-26', 'Tom Petty'],
  // October
  ['2026-10-02', 'Metallica'],
  ['2026-10-03', 'Three Days Grace'],
  ['2026-10-09', 'The 1985', true],
  ['2026-10-10', 'Mötley Crüe'],
  ['2026-10-16', 'Sammy Hagar'],
  ['2026-10-17', 'Rod Stewart'],
  ['2026-10-23', 'Van Halen'],
  ['2026-10-24', 'Paramore'],
  ['2026-10-30', 'Whitesnake'],
  ['2026-10-31', 'Ozzy Osbourne'],
  // November
  ['2026-11-06', 'Def Leppard'],
  ['2026-11-07', 'Eagles'],
  ['2026-11-13', 'Girls Night Out', true],
  ['2026-11-14', 'Fleetwood Mac'],
  ['2026-11-20', 'AC/DC'],
  ['2026-11-21', 'Bob Seger'],
  ['2026-11-25', 'FiftyAmpFuse', true],
  ['2026-11-27', 'Queen'],
  ['2026-11-28', 'Bon Jovi'],
  // December
  ['2026-12-04', 'Journey'],
  ['2026-12-05', 'Green Day'],
  ['2026-12-11', 'Guns N\' Roses'],
  ['2026-12-12', 'HairMania', true],
  ['2026-12-18', 'Complete Unknowns', true],
  ['2026-12-19', 'Trans Siberian'],
  // 12/25 Closed - Christmas — skip
  ['2026-12-26', 'Dueling Pianos', true],
];

function buildEventName(band, isOriginal) {
  if (isOriginal) return `${band} at Chateau Aeronautique Winery`;
  return `${band} Tribute at Chateau Aeronautique Winery`;
}

function buildDescription(band, isOriginal) {
  if (isOriginal) {
    return `${band} performs live at Chateau Aeronautique Winery's all-weather Biergarten. Aviation-themed winery with live music every Friday and Saturday night.`;
  }
  return `${band} tribute band performs live at Chateau Aeronautique Winery's all-weather Biergarten. Part of the 2026 Tribute Bands series — aviation-themed winery with live tribute concerts every Friday and Saturday night.`;
}

function buildNotionPage(date, band, isOriginal = false) {
  const eventName = buildEventName(band, isOriginal);
  const description = buildDescription(band, isOriginal);

  return {
    parent: { database_id: EVENTS_DB },
    properties: {
      'Event Name': {
        title: [{ text: { content: eventName } }],
      },
      'Status': {
        status: { name: 'Published' },
      },
      'Event date': {
        date: { start: date },
      },
      'Location': {
        rich_text: [{ text: { content: LOCATION } }],
      },
      'Description': {
        rich_text: [{ text: { content: description } }],
      },
      'Category': {
        rich_text: [{ text: { content: 'Live Music' } }],
      },
      'Phone': {
        phone_number: PHONE,
      },
      'Attendance': {
        select: { name: 'just_show_up' },
      },
      'Source': {
        select: { name: 'Self-Submitted' },
      },
    },
  };
}

async function createEvent(pageData, index) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(pageData),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`❌ [${index + 1}] FAILED: ${pageData.properties['Event Name'].title[0].text.content}`);
    console.error(`   ${res.status}: ${err}`);
    return false;
  }

  const data = await res.json();
  console.log(`✅ [${index + 1}/${schedule.length}] ${pageData.properties['Event Name'].title[0].text.content} — ${pageData.properties['Event date'].date.start}`);
  return true;
}

async function main() {
  console.log(`\n🎸 Importing ${schedule.length} Chateau Aeronautique events...\n`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < schedule.length; i++) {
    const [date, band, isOriginal] = schedule[i];
    const pageData = buildNotionPage(date, band, !!isOriginal);

    const ok = await createEvent(pageData, i);
    if (ok) success++;
    else failed++;

    // Small delay to respect rate limits (3 req/sec for Notion)
    if (i < schedule.length - 1) {
      await new Promise(r => setTimeout(r, 350));
    }
  }

  console.log(`\n🎯 Done! ${success} created, ${failed} failed out of ${schedule.length} total.\n`);
}

main().catch(console.error);
