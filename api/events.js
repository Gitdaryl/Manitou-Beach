import { Resend } from 'resend';

// Fetch all pages from a Notion database query, following cursors past the 100-record limit
async function queryAllNotionPages(dbId, token, body) {
  const url = `https://api.notion.com/v1/databases/${dbId}/query`;
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28',
  };
  let results = [];
  let startCursor;
  do {
    const pageBody = startCursor ? { ...body, start_cursor: startCursor } : body;
    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(pageBody) });
    if (!res.ok) throw new Error(`Notion query failed: ${await res.text()}`);
    const data = await res.json();
    results = results.concat(data.results);
    startCursor = data.has_more ? data.next_cursor : null;
  } while (startCursor);
  return results;
}

// Ensure URLs entered in Notion without a protocol prefix still work as links
function normalizeUrl(url) {
  if (!url || !url.trim()) return url;
  const u = url.trim();
  return /^https?:\/\//i.test(u) ? u : 'https://' + u;
}

export default async function handler(req, res) {
  // POST — submit a new event
  if (req.method === 'POST') {
    const { name, category, email, phone, description, date, time, timeEnd, location, eventUrl, imageUrl, cost, recurring, recurringDay, attendance, rsvpCapacity, _hp } = req.body;

    // Honeypot — bots fill hidden fields, humans don't
    if (_hp) return res.status(200).json({ success: true });

    if (!name || !email) {
      return res.status(400).json({ error: 'Event name and email are required' });
    }

    let normalizedEventUrl = null;
    if (eventUrl && eventUrl.trim()) {
      let url = eventUrl.trim();
      if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
      normalizedEventUrl = url;
    }

    const editToken = crypto.randomUUID();

    const buildProperties = ({ includeEventUrl = true, includeImageUrl = true } = {}) => {
      const properties = {
        'Event Name': { title: [{ text: { content: name } }] },
        'Category': { rich_text: [{ text: { content: category || '' } }] },
        'Email': { email: email },
        'Phone': { phone_number: phone || null },
        'Description': { rich_text: [{ text: { content: description || '' } }] },
        'Time': { rich_text: [{ text: { content: time || '' } }] },
        'Location': { rich_text: [{ text: { content: location || '' } }] },
        'Edit Token': { rich_text: [{ text: { content: editToken } }] },
      };
      if (date) properties['Event date'] = { date: { start: date } };
      if (includeEventUrl && normalizedEventUrl) properties['Event URL'] = { url: normalizedEventUrl };
      if (includeImageUrl && imageUrl) properties['Image URL'] = { url: imageUrl };
      if (cost) properties['Cost'] = { rich_text: [{ text: { content: cost } }] };
      if (recurring && recurring !== 'None') properties['Recurring'] = { select: { name: recurring } };
      if (recurringDay) properties['Recurring Day'] = { select: { name: recurringDay } };
      if (timeEnd) properties['Time End'] = { rich_text: [{ text: { content: timeEnd } }] };
      if (attendance) properties['Attendance'] = { select: { name: attendance } };
      if (rsvpCapacity) properties['RSVP Capacity'] = { number: parseInt(rsvpCapacity, 10) };
      return properties;
    };

    const postToNotion = async (properties) => fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({ parent: { database_id: process.env.NOTION_DB_EVENTS }, properties }),
    });

    try {
      let response = await postToNotion(buildProperties());
      if (!response.ok) {
        const err = await response.json();
        console.error('Notion error (first attempt):', JSON.stringify(err));
        
        // If Notion rejects because a property doesn't exist or is the wrong type (like Event URL)
        const isUrlFieldError = err?.message?.toLowerCase().includes('event url') ||
          err?.message?.toLowerCase().includes('image url') || err?.code === 'validation_error';
          
        if (isUrlFieldError) {
          console.log('Attempting fallback without URL fields to bypass Notion schema mismatch...');
          response = await postToNotion(buildProperties({ includeEventUrl: false, includeImageUrl: false }));
          if (!response.ok) {
            const retryErr = await response.json();
            return res.status(500).json({ 
              error: 'Submission failed', 
              notionError: retryErr?.message || 'Unknown Notion error. Check that your Notion Database column types precisely match the code.'
            });
          }
        } else {
          return res.status(500).json({ 
            error: 'Submission failed', 
            notionError: err?.message || 'Check your Notion Database columns.'
          });
        }
      }
      // Send confirmation email (best-effort — never block the response)
      if (email && process.env.RESEND_API_KEY) {
        const siteUrl = process.env.SITE_URL || 'https://manitoubeach.yetigroove.com';
        const editLink = `${siteUrl}/events/edit?token=${editToken}`;
        const dateDisplay = date ? new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '';
        const timeDisplay = [time, timeEnd].filter(Boolean).join(' – ');
        try {
          const resend = new Resend(process.env.RESEND_API_KEY);
          await resend.emails.send({
            from: 'Manitou Beach <events@yetigroove.com>',
            to: email,
            subject: `Your event "${name}" has been submitted`,
            html: `
              <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#FAF6EF;">
                <h1 style="color:#1A2830;font-size:22px;margin:0 0 8px;">Event submitted!</h1>
                <p style="color:#5C5248;font-size:15px;margin:0 0 24px;line-height:1.7;">
                  <strong>${name}</strong> has been received and will be reviewed within 48 hours.
                  ${dateDisplay ? `<br/>${dateDisplay}` : ''}
                  ${timeDisplay ? `<br/>${timeDisplay}` : ''}
                  ${location ? `<br/>${location}` : ''}
                </p>
                <div style="background:#fff;border-radius:12px;padding:20px 24px;margin-bottom:24px;border:1px solid #E8E0D5;">
                  <p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Need to update details?</p>
                  <p style="margin:0 0 16px;color:#3B3228;font-size:14px;line-height:1.6;">Use your private edit link to update your event's time, location, description, or photo at any time.</p>
                  <a href="${editLink}" style="display:inline-block;background:#1A2830;color:#FAF6EF;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;">
                    Edit My Event
                  </a>
                  <p style="margin:12px 0 0;color:#8C806E;font-size:11px;">Keep this email — it contains your private edit link.</p>
                </div>
                <div style="background:#FFF8F0;border-radius:12px;padding:20px 24px;border:1px solid #F0E4D0;">
                  <p style="margin:0 0 8px;color:#D4845A;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Want more visibility?</p>
                  <p style="margin:0 0 16px;color:#5C5248;font-size:14px;line-height:1.6;">Hero Feature · Newsletter Spotlight · Featured Banners.<br/>Get your event in front of every lake neighbor.</p>
                  <a href="${siteUrl}/promote" style="display:inline-block;background:#D4845A;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;">
                    See Promotion Packages →
                  </a>
                </div>
              </div>
            `,
          });
        } catch (emailErr) {
          console.error('Event confirmation email error:', emailErr.message);
        }
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Server error:', err.message);
      return res.status(500).json({ error: 'Server error', detail: err.message });
    }
  }

  // GET — fetch approved/published events
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
  try {
    const queryBody = {
      filter: {
        or: [
          { property: 'Status', status: { equals: 'Approved' } },
          { property: 'Status', status: { equals: 'Published' } },
        ],
      },
      sorts: [{ property: 'Event date', direction: 'ascending' }],
    };

    let pages;
    try {
      pages = await queryAllNotionPages(process.env.NOTION_DB_EVENTS, process.env.NOTION_TOKEN_EVENTS, queryBody);
    } catch (err) {
      console.error('Notion query failed:', err.message);
      return res.status(200).json({ events: [], recurring: [] });
    }

    const now = new Date();

    const allEvents = pages
      .map(page => {
        const p = page.properties;
        const dateStr = p['Event date']?.date?.start;
        const recurringVal = p['Recurring']?.select?.name || null;
        return {
          id: page.id,
          name: p['Event Name']?.title?.[0]?.text?.content || '',
          date: dateStr || '',
          dateEnd: p['Event date']?.date?.end || null,
          category: p['Category']?.rich_text?.[0]?.text?.content || 'Community',
          description: p['Description']?.rich_text?.[0]?.text?.content || '',
          time: p['Time']?.rich_text?.[0]?.text?.content || '',
          location: p['Location']?.rich_text?.[0]?.text?.content || '',
          imageUrl: normalizeUrl(p['Image URL']?.url || null),
          email: p['Email']?.email || '',
          eventUrl: normalizeUrl(p['Event URL']?.url || null),
          cost: p['Cost']?.rich_text?.[0]?.text?.content || null,
          recurring: recurringVal,
          recurringDay: p['Recurring Day']?.select?.name || null,
          timeEnd: p['Time End']?.rich_text?.[0]?.text?.content || null,
          attendance: p['Attendance']?.select?.name || null,
          updated: p['Updated']?.checkbox || false,
          rsvpEnabled: p['RSVP Enabled']?.checkbox || false,
          heroFeature: p['Hero Feature']?.checkbox || false,
          promoType: p['Promo Type']?.select?.name || null,
          promoEnd: p['Promo End']?.date?.start || null,
          ticketsEnabled: p['Tickets Enabled']?.checkbox || false,
          ticketPrice: p['Ticket Price']?.number || null,
          ticketCapacity: p['Ticket Capacity']?.number || null,
          ticketsSold: p['Tickets Sold']?.number || 0,
          rsvpCapacity: p['RSVP Capacity']?.number || 0,
          rsvpsCount: p['RSVPs Count']?.number || 0,
          vendorRegEnabled: p['Vendor Reg Enabled']?.checkbox || false,
        };
      })
      .filter(e => e.name);

    const recurring = allEvents.filter(e => e.recurring === 'Weekly' || e.recurring === 'Monthly');
    const events = allEvents
      .filter(e => e.recurring !== 'Weekly' && e.recurring !== 'Monthly')
      .filter(e => {
        if (!e.date) return false;
        return new Date(e.date + 'T23:59:59') >= now;
      });

    return res.status(200).json({ events, recurring });
  } catch (err) {
    console.error('Events API error:', err.message);
    return res.status(200).json({ events: [], recurring: [] });
  }
}
