/**
 * auto-log.js — Auto-log outreach emails to CRM sheet
 * 
 * Usage:
 *   node auto-log.js log <company> <contact> <email> <subject>
 *   node auto-log.js reply <email> <status>
 *   node auto-log.js sync  — bulk sync from sent-tracker.json
 *   node auto-log.js check — scan Gmail for replies to outreach emails
 */

const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const SHEET_ID = '1oiuiGHWyg01RKnFVk5FPcHI10y7VBWrAE1MaTAiM-sw';
const KEY_FILE = path.join(__dirname, 'service-account.json');
const TRACKER_FILE = path.join(__dirname, 'sent-tracker.json');
const LOG_SHEET = 'Outreach Log';

async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function ensureLogSheet(sheets) {
  const res = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const names = res.data.sheets.map(s => s.properties.title);
  if (!names.includes(LOG_SHEET)) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [{
          addSheet: { properties: { title: LOG_SHEET } }
        }]
      }
    });
    // Add header row
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `'${LOG_SHEET}'!A1:H1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [['Date', 'Company', 'Position/Title', 'Contact', 'Email', 'Subject', 'Status', 'Notes']]
      }
    });
    console.log('Created "Outreach Log" sheet with headers');
  }
}

async function logSend(company, contact, email, subject, date = null, status = 'Sent') {
  const sheets = await getSheets();
  await ensureLogSheet(sheets);
  const d = date || new Date().toISOString().split('T')[0];
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `'${LOG_SHEET}'!A:H`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[d, company, '', contact, email, subject, status, '']]
    }
  });
  console.log(`Logged: ${company} (${email}) — ${status}`);
}

async function updateReply(email, status, notes = '') {
  const sheets = await getSheets();
  // Read all rows to find matching email
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `'${LOG_SHEET}'!A:H`,
  });
  const rows = res.data.values || [];
  for (let i = rows.length - 1; i >= 1; i--) {
    if (rows[i][4] === email) {
      // Update status (col G) and notes (col H)
      const range = `'${LOG_SHEET}'!G${i + 1}:H${i + 1}`;
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [[status, notes]] }
      });
      console.log(`Updated ${email} → ${status}`);
      return;
    }
  }
  console.log(`No row found for ${email}`);
}

async function syncFromTracker() {
  const sheets = await getSheets();
  await ensureLogSheet(sheets);
  
  const tracker = JSON.parse(fs.readFileSync(TRACKER_FILE, 'utf8'));
  
  // Get existing logged emails to avoid duplicates
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `'${LOG_SHEET}'!E:E`,
  });
  const existing = new Set((res.data.values || []).flat());
  
  const allSent = tracker.sent || [];
  const newRows = [];
  
  for (const s of allSent) {
    if (existing.has(s.email)) continue;
    const status = s.status === 'bounced' ? 'Bounced' : 'Sent';
    newRows.push([
      s.date || '2026-02-09',
      s.company || '',
      s.title || '',
      s.contact || '',
      s.email,
      s.subject || '',
      status,
      s.note || ''
    ]);
  }
  
  if (newRows.length === 0) {
    console.log('All sends already logged');
    return;
  }
  
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `'${LOG_SHEET}'!A:H`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: newRows }
  });
  console.log(`Synced ${newRows.length} sends to Outreach Log`);
}

async function checkReplies() {
  // Use Gmail API to check for replies
  const { google: goog } = require('googleapis');
  const tokenData = JSON.parse(fs.readFileSync(path.join(__dirname, 'token.json'), 'utf8'));
  const credData = JSON.parse(fs.readFileSync(path.join(__dirname, 'credentials.json'), 'utf8'));
  const { client_id, client_secret } = credData.installed || credData.web;
  
  const oauth2 = new goog.auth.OAuth2(client_id, client_secret);
  oauth2.setCredentials(tokenData);
  const gmail = goog.gmail({ version: 'v1', auth: oauth2 });
  
  // Search for replies in last 24h
  const res = await gmail.users.messages.list({
    userId: 'me',
    q: 'is:inbox newer_than:1d',
    maxResults: 20,
  });
  
  const messages = res.data.messages || [];
  if (messages.length === 0) {
    console.log('No new inbox messages');
    return;
  }
  
  // Load tracker to cross-reference
  const tracker = JSON.parse(fs.readFileSync(TRACKER_FILE, 'utf8'));
  const sentEmails = new Set((tracker.sent || []).map(s => s.email.toLowerCase()));
  
  const replies = [];
  for (const msg of messages) {
    const detail = await gmail.users.messages.get({
      userId: 'me',
      id: msg.id,
      format: 'metadata',
      metadataHeaders: ['From', 'Subject'],
    });
    const headers = detail.data.payload.headers;
    const from = (headers.find(h => h.name === 'From') || {}).value || '';
    const subject = (headers.find(h => h.name === 'Subject') || {}).value || '';
    
    // Extract email from "Name <email>" format
    const emailMatch = from.match(/<([^>]+)>/) || [null, from];
    const fromEmail = (emailMatch[1] || '').toLowerCase().trim();
    
    if (sentEmails.has(fromEmail)) {
      replies.push({ from: fromEmail, subject, id: msg.id });
      console.log(`📬 REPLY from ${fromEmail}: ${subject}`);
    }
  }
  
  if (replies.length === 0) {
    console.log('No replies from outreach contacts');
  } else {
    // Update sheet status for each reply
    for (const r of replies) {
      await updateReply(r.from, 'Replied', `Reply detected ${new Date().toISOString().split('T')[0]}`);
    }
  }
}

// CLI
const cmd = process.argv[2];
if (cmd === 'log') {
  const [,, , company, contact, email, subject] = process.argv;
  logSend(company, contact, email, subject).catch(e => { console.error(e.message); process.exit(1); });
} else if (cmd === 'reply') {
  const [,, , email, status] = process.argv;
  updateReply(email, status || 'Replied').catch(e => { console.error(e.message); process.exit(1); });
} else if (cmd === 'sync') {
  syncFromTracker().catch(e => { console.error(e.message); process.exit(1); });
} else if (cmd === 'check') {
  checkReplies().catch(e => { console.error(e.message); process.exit(1); });
} else {
  console.log('Usage: node auto-log.js <log|reply|sync|check>');
  console.log('  log <company> <contact> <email> <subject>  — log a single send');
  console.log('  reply <email> [status]                      — update status for a reply');
  console.log('  sync                                        — bulk sync from sent-tracker.json');
  console.log('  check                                       — scan Gmail for replies');
}
