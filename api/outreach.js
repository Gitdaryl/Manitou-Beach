// /api/outreach.js
// Outreach team CRM - Blob-backed JSON database
// GET  /api/outreach              - read full DB (requires PIN)
// POST /api/outreach              - create new business entry (admin only)
// PATCH /api/outreach             - claim, log activity, update status

import { put, list } from '@vercel/blob';

const AGENTS = {
  lead:      { label: 'Outreach Lead',        color: '#7D6EAA' },
  connector: { label: 'Community Connector',  color: '#5B8A6E' },
  followup:  { label: 'Follow-Up Agent',      color: '#D4845A' },
  admin:     { label: 'Daryl (Admin)',         color: '#5B7E95' },
};

function resolveAgent(pin) {
  if (!pin) return null;
  if (pin === process.env.OUTREACH_PIN_LEAD)      return 'lead';
  if (pin === process.env.OUTREACH_PIN_CONNECTOR) return 'connector';
  if (pin === process.env.OUTREACH_PIN_FOLLOWUP)  return 'followup';
  if (pin === process.env.OUTREACH_PIN_ADMIN)     return 'admin';
  return null;
}

async function readDb() {
  try {
    const { blobs } = await list({ prefix: 'outreach/db', token: process.env.BLOB_READ_WRITE_TOKEN });
    if (!blobs.length) return { businesses: [] };
    const latest = blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0];
    const res = await fetch(latest.url);
    if (!res.ok) return { businesses: [] };
    return await res.json();
  } catch {
    return { businesses: [] };
  }
}

async function writeDb(data) {
  const content = JSON.stringify({ ...data, lastUpdated: new Date().toISOString() });
  await put('outreach/db.json', content, {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN,
    contentType: 'application/json',
    addRandomSuffix: false,
  });
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  const pin = req.headers['x-outreach-pin'] || req.body?.pin || req.query?.pin;
  const agent = resolveAgent(pin);
  if (!agent) return res.status(401).json({ error: 'Invalid PIN' });

  // ── GET ──────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const db = await readDb();
    const { businesses = [] } = db;

    // Non-admins only see their own + unclaimed
    const visible = agent === 'admin'
      ? businesses
      : businesses.filter(b => !b.assignedTo || b.assignedTo === agent);

    const stats = {
      total: businesses.length,
      byStatus: {},
      byAgent: {},
    };
    businesses.forEach(b => {
      stats.byStatus[b.status] = (stats.byStatus[b.status] || 0) + 1;
      if (b.assignedTo) stats.byAgent[b.assignedTo] = (stats.byAgent[b.assignedTo] || 0) + 1;
    });

    return res.status(200).json({ agent, agents: AGENTS, businesses: visible, stats, lastUpdated: db.lastUpdated });
  }

  // ── POST — create new business (admin only) ──────────────────────────────
  if (req.method === 'POST') {
    if (agent !== 'admin') return res.status(403).json({ error: 'Admin only' });

    const { name, category, area, phone, contact, priority, notes } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const db = await readDb();
    const newBiz = {
      id: makeId(),
      name: name.trim(),
      category: category || 'Other',
      area: area || 'Manitou Beach',
      phone: phone || '',
      contact: contact || '',
      assignedTo: null,
      status: 'new',
      priority: priority || 'warm',
      notes: notes || '',
      lastActivity: null,
      activityLog: [],
      createdAt: new Date().toISOString(),
    };

    db.businesses = [...(db.businesses || []), newBiz];
    await writeDb(db);
    return res.status(201).json({ ok: true, business: newBiz });
  }

  // ── PATCH — claim / log activity / update status ─────────────────────────
  if (req.method === 'PATCH') {
    const { id, action } = req.body;
    if (!id || !action) return res.status(400).json({ error: 'id and action required' });

    const db = await readDb();
    const idx = db.businesses.findIndex(b => b.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Business not found' });

    const biz = { ...db.businesses[idx] };

    if (action === 'claim') {
      if (biz.assignedTo && biz.assignedTo !== agent && agent !== 'admin') {
        return res.status(409).json({ error: 'Already claimed by another agent' });
      }
      biz.assignedTo = agent;

    } else if (action === 'unclaim') {
      if (agent !== 'admin') return res.status(403).json({ error: 'Admin only' });
      biz.assignedTo = null;

    } else if (action === 'log') {
      const { type, note, newStatus } = req.body;
      const entry = {
        date: new Date().toISOString(),
        agent,
        type: type || 'note',
        note: (note || '').slice(0, 300),
      };
      biz.activityLog = [...(biz.activityLog || []), entry];
      biz.lastActivity = entry.date;
      if (newStatus) biz.status = newStatus;

    } else if (action === 'status') {
      const { newStatus } = req.body;
      if (!newStatus) return res.status(400).json({ error: 'newStatus required' });
      biz.status = newStatus;

    } else if (action === 'notes') {
      biz.notes = (req.body.notes || '').slice(0, 500);

    } else {
      return res.status(400).json({ error: 'Unknown action' });
    }

    db.businesses[idx] = biz;
    await writeDb(db);
    return res.status(200).json({ ok: true, business: biz });
  }

  // ── DELETE — remove business (admin only) ────────────────────────────────
  if (req.method === 'DELETE') {
    if (agent !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const { id } = req.body;
    const db = await readDb();
    db.businesses = (db.businesses || []).filter(b => b.id !== id);
    await writeDb(db);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
