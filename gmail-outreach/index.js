/**
 * Gmail Outreach Tool
 * Send outreach emails via Gmail API
 * 
 * Setup:
 * 1. Create Google Cloud project at https://console.cloud.google.com
 * 2. Enable Gmail API
 * 3. Create OAuth 2.0 credentials (Desktop app)
 * 4. Download credentials.json to this directory
 * 5. Run: node auth.js (opens browser for one-time consent)
 * 6. Then use: node index.js send --to "email" --subject "..." --body "..."
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const TOKEN_PATH = path.join(__dirname, 'token.json');
const SCOPES = ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.readonly'];

async function getAuth() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error('Missing credentials.json — download OAuth credentials from Google Cloud Console');
  }
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  }
  throw new Error('Missing token.json — run: node auth.js first');
}

function makeRawEmail({ to, subject, body, from }) {
  const email = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    body
  ].join('\r\n');
  return Buffer.from(email).toString('base64url');
}

async function sendEmail({ to, subject, body }) {
  const auth = await getAuth();
  const gmail = google.gmail({ version: 'v1', auth });
  
  // Get sender's email
  const profile = await gmail.users.getProfile({ userId: 'me' });
  const from = profile.data.emailAddress;

  const raw = makeRawEmail({ to, subject, body, from });
  const result = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw }
  });
  
  console.log(`✅ Email sent to ${to} (id: ${result.data.id})`);
  return result.data;
}

async function listEmails({ maxResults = 10, query = '' } = {}) {
  const auth = await getAuth();
  const gmail = google.gmail({ version: 'v1', auth });
  
  const res = await gmail.users.messages.list({
    userId: 'me',
    maxResults,
    q: query
  });
  
  if (!res.data.messages) {
    console.log('No messages found.');
    return [];
  }
  
  const messages = [];
  for (const msg of res.data.messages) {
    const detail = await gmail.users.messages.get({ userId: 'me', id: msg.id, format: 'metadata' });
    const headers = detail.data.payload.headers;
    const subject = headers.find(h => h.name === 'Subject')?.value || '(no subject)';
    const from = headers.find(h => h.name === 'From')?.value || '';
    const date = headers.find(h => h.name === 'Date')?.value || '';
    messages.push({ id: msg.id, subject, from, date });
    console.log(`${date} | ${from} | ${subject}`);
  }
  return messages;
}

// CLI
const [,, command, ...args] = process.argv;

if (command === 'send') {
  const parseArg = (flag) => {
    const idx = args.indexOf(flag);
    return idx >= 0 ? args[idx + 1] : null;
  };
  const to = parseArg('--to');
  const subject = parseArg('--subject');
  const body = parseArg('--body');
  
  if (!to || !subject || !body) {
    console.error('Usage: node index.js send --to "email" --subject "..." --body "..."');
    process.exit(1);
  }
  sendEmail({ to, subject, body }).catch(console.error);
  
} else if (command === 'list') {
  const query = args.join(' ');
  listEmails({ query }).catch(console.error);
  
} else {
  console.log('Gmail Outreach Tool');
  console.log('Commands:');
  console.log('  node index.js send --to "email" --subject "..." --body "..."');
  console.log('  node index.js list [query]');
  console.log('\nSetup: See README.md');
}
