/**
 * Dedup Guard — prevents duplicate email sends.
 * 
 * Before any send, checks:
 * 1. Gmail sent folder for recent emails to the same address (14-day window)
 * 2. Hard block on same subject line to same contact ever
 * 
 * Usage:
 *   const { checkDedup } = require('./dedup-guard');
 *   const result = await checkDedup(to, subject);
 *   if (result.blocked) { console.log(result.reason); skip; }
 */

const fs = require('fs');
const { google } = require('googleapis');

function getAuth() {
  const creds = JSON.parse(fs.readFileSync(__dirname + '/credentials.json'));
  const { client_id, client_secret } = creds.installed || creds.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, 'http://localhost:3000/callback');
  const tokens = JSON.parse(fs.readFileSync(__dirname + '/token.json'));
  oAuth2Client.setCredentials(tokens);
  return oAuth2Client;
}

/**
 * Check if sending to this address+subject is safe.
 * @param {string} to - recipient email
 * @param {string} subject - email subject
 * @returns {{ blocked: boolean, reason?: string }}
 */
async function checkDedup(to, subject) {
  const auth = getAuth();
  const gmail = google.gmail({ version: 'v1', auth });

  // Search sent folder for any email to this address
  const query = `in:sent to:${to}`;
  const res = await gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults: 50,
  });

  const messages = res.data.messages || [];
  if (messages.length === 0) {
    return { blocked: false };
  }

  const now = Date.now();
  const FOURTEEN_DAYS = 14 * 24 * 60 * 60 * 1000;

  for (const msg of messages) {
    const detail = await gmail.users.messages.get({
      userId: 'me',
      id: msg.id,
      format: 'metadata',
      metadataHeaders: ['Subject', 'Date'],
    });

    const headers = detail.data.payload.headers;
    const sentSubject = headers.find(h => h.name === 'Subject')?.value || '';
    const sentDate = headers.find(h => h.name === 'Date')?.value;
    const sentTime = sentDate ? new Date(sentDate).getTime() : 0;

    // Hard block: same subject to same contact EVER
    if (sentSubject.toLowerCase().trim() === subject.toLowerCase().trim()) {
      return {
        blocked: true,
        reason: `HARD BLOCK: Already sent "${sentSubject}" to ${to} on ${sentDate}`,
      };
    }

    // 14-day window: any email to this contact
    if (sentTime && (now - sentTime) < FOURTEEN_DAYS) {
      return {
        blocked: true,
        reason: `14-DAY BLOCK: Sent "${sentSubject}" to ${to} on ${sentDate} (${Math.round((now - sentTime) / 86400000)}d ago)`,
      };
    }
  }

  return { blocked: false };
}

module.exports = { checkDedup };
