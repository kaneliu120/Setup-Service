#!/usr/bin/env node

/**
 * Sync bookings from production PostgreSQL to local Obsidian Vault.
 * Runs incrementally — only creates new .md files, never overwrites existing ones.
 *
 * Usage:
 *   node scripts/sync-obsidian.js
 *
 * Requires: scripts/.env.sync with SYNC_DATABASE_URL and OBSIDIAN_VAULT_PATH
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Load env from scripts/.env.sync
const envPath = path.join(__dirname, '.env.sync');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const val = trimmed.slice(eqIndex + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

const DATABASE_URL = process.env.SYNC_DATABASE_URL;
const VAULT_PATH = process.env.OBSIDIAN_VAULT_PATH || path.join(process.env.HOME || '~', 'Obsidian Vault');
const RECORD_DIR = path.join(VAULT_PATH, '记录');
const STATE_FILE = path.join(__dirname, '.sync-state.json');

if (!DATABASE_URL) {
  console.error('SYNC_DATABASE_URL is not set. Check scripts/.env.sync');
  process.exit(1);
}

function loadState() {
  if (fs.existsSync(STATE_FILE)) {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  }
  return { last_synced_id: 0 };
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

function formatDate(date) {
  return new Date(date).toLocaleString('zh-CN', { timeZone: 'Asia/Manila' });
}

function buildBookingMarkdown(b) {
  const dateStr = formatDate(b.appointment_time);
  const createdStr = formatDate(b.created_at);

  return `---
tags: [booking, landing-page, synced]
created: ${createdStr}
status: ${b.status}
---

# 预约 - ${b.name}

- **称呼**: ${b.name}
- **联系方式**: ${b.contact} (${b.contact_type || 'N/A'})
- **预约时间**: ${dateStr}
- **来源页面**: ${b.source_slug || 'N/A'}
- **状态**: ${b.status}

## 预约内容

${b.content}

---
*同步于 ${formatDate(new Date())}*
`;
}

function buildConsultationMarkdown(b) {
  const createdStr = formatDate(b.created_at);

  return `---
tags: [consultation, landing-page, synced]
created: ${createdStr}
status: consultation
---

# 咨询 - ${b.name}

- **联系方式**: ${b.contact || '未提供'}
- **来源页面**: ${b.source_slug || 'N/A'}

## 咨询内容

${b.content}

---
*同步于 ${formatDate(new Date())}*
`;
}

function getFileName(b) {
  if (b.status === 'consultation') {
    return `咨询-${b.id}.md`;
  }
  return `预约-${b.name}-${b.id}.md`;
}

async function main() {
  const state = loadState();
  console.log(`[sync] Starting. Last synced ID: ${state.last_synced_id}`);

  const client = new Client({
    connectionString: DATABASE_URL.replace('sslmode=require', 'sslmode=verify-full'),
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    const res = await client.query(
      'SELECT * FROM bookings WHERE id > $1 ORDER BY id ASC',
      [state.last_synced_id],
    );

    if (res.rows.length === 0) {
      console.log('[sync] No new bookings.');
      return;
    }

    console.log(`[sync] Found ${res.rows.length} new record(s).`);

    if (!fs.existsSync(RECORD_DIR)) {
      fs.mkdirSync(RECORD_DIR, { recursive: true });
    }

    let synced = 0;
    let maxId = state.last_synced_id;

    for (const booking of res.rows) {
      const fileName = getFileName(booking);
      const filePath = path.join(RECORD_DIR, fileName);

      if (fs.existsSync(filePath)) {
        console.log(`[sync] Skip (exists): ${fileName}`);
      } else {
        const content =
          booking.status === 'consultation'
            ? buildConsultationMarkdown(booking)
            : buildBookingMarkdown(booking);

        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`[sync] Created: ${fileName}`);
        synced++;
      }

      if (booking.id > maxId) maxId = booking.id;
    }

    state.last_synced_id = maxId;
    saveState(state);
    console.log(`[sync] Done. Synced ${synced} file(s). Last ID: ${maxId}`);
  } catch (err) {
    console.error('[sync] Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
