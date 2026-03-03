const fs = require('fs');
const { google } = require('googleapis');

const CREDS_PATH = __dirname + '/credentials.json';
const TOKEN_PATH = __dirname + '/token.json';

function getAuth() {
  const creds = JSON.parse(fs.readFileSync(CREDS_PATH));
  const { client_id, client_secret } = creds.installed || creds.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, 'http://localhost:3000/callback');
  const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH));
  oAuth2Client.setCredentials(tokens);
  return oAuth2Client;
}

async function sendEmail(to, subject, body) {
  // Safety: block known bad domains
  const blocked = ['heygumbo.com'];
  const domain = to.split('@')[1]?.toLowerCase();
  if (blocked.includes(domain)) {
    throw new Error(`BLOCKED: "${to}" uses blocked domain "${domain}". Did you mean @hellogumbo.com?`);
  }

  const auth = getAuth();
  const gmail = google.gmail({ version: 'v1', auth });

  // Convert newlines to HTML: single \n -> <br>, double \n\n -> <br><br>
  const htmlBody = body
    .replace(/\n\n+/g, '<br><br>')
    .replace(/\n/g, '<br>');

  // BCC jeff and alex on all outgoing emails (requested 2026-02-18)
  const bcc = 'jeff@hellogumbo.com, alex@hellogumbo.com';

  const signature = `<br><br>--<br>Jim Jensen<br><a href="https://hellogumbo.com">Gumbo</a> | <a href="https://hellogumbo.com">hellogumbo.com</a><br>AI-first engineering, served simple.<br><a href="mailto:jim@hellogumbo.com">jim@hellogumbo.com</a>`;

  const raw = Buffer.from(
    `From: Jim from Gumbo <jim@hellogumbo.com>\r\nTo: ${to}\r\nBcc: ${bcc}\r\nSubject: ${subject}\r\nContent-Type: text/html; charset=utf-8\r\n\r\n<div dir="ltr">${htmlBody}${signature}</div>`
  ).toString('base64url');

  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw },
  });

  console.log('✅ Sent:', res.data.id);
  return res.data;
}

async function listInbox(maxResults = 10) {
  const auth = getAuth();
  const gmail = google.gmail({ version: 'v1', auth });

  const res = await gmail.users.messages.list({
    userId: 'me',
    maxResults,
    labelIds: ['INBOX'],
  });

  if (!res.data.messages) {
    console.log('Inbox empty');
    return [];
  }

  const msgs = [];
  for (const m of res.data.messages) {
    const detail = await gmail.users.messages.get({ userId: 'me', id: m.id, format: 'metadata', metadataHeaders: ['From', 'Subject', 'Date'] });
    const headers = detail.data.payload.headers;
    msgs.push({
      id: m.id,
      from: headers.find(h => h.name === 'From')?.value,
      subject: headers.find(h => h.name === 'Subject')?.value,
      date: headers.find(h => h.name === 'Date')?.value,
      snippet: detail.data.snippet,
    });
  }

  return msgs;
}

async function createDraft(to, subject, body) {
  const auth = getAuth();
  const gmail = google.gmail({ version: 'v1', auth });

  // Convert newlines to HTML: single \n -> <br>, double \n\n -> <br><br>
  const htmlBody = body
    .replace(/\n\n+/g, '<br><br>')
    .replace(/\n/g, '<br>');

  const bcc = 'jeff@hellogumbo.com, alex@hellogumbo.com';

  const signature = `<br><br>--<br>Jim Jensen<br><a href="https://hellogumbo.com">Gumbo</a> | <a href="https://hellogumbo.com">hellogumbo.com</a><br>AI-first engineering, served simple.<br><a href="mailto:jim@hellogumbo.com">jim@hellogumbo.com</a>`;

  const raw = Buffer.from(
    `From: Jim from Gumbo <jim@hellogumbo.com>\r\nTo: ${to}\r\nBcc: ${bcc}\r\nSubject: ${subject}\r\nContent-Type: text/html; charset=utf-8\r\n\r\n<div dir="ltr">${htmlBody}${signature}</div>`
  ).toString('base64url');

  const res = await gmail.users.drafts.create({
    userId: 'me',
    requestBody: { message: { raw } },
  });

  console.log('✅ Draft created:', res.data.id);
  return res.data;
}

// Exports for programmatic use
module.exports = { sendEmail, createDraft, listInbox };

// CLI usage
const cmd = process.argv[2];
if (cmd === 'send') {
  const [, , , to, subject, ...bodyParts] = process.argv;
  sendEmail(to, subject, bodyParts.join(' ')).catch(console.error);
} else if (cmd === 'inbox') {
  listInbox(parseInt(process.argv[3]) || 10).then(msgs => console.log(JSON.stringify(msgs, null, 2))).catch(console.error);
} else if (cmd === 'draft') {
  const [, , , to, subject, ...bodyParts] = process.argv;
  createDraft(to, subject, bodyParts.join(' ')).catch(console.error);
} else {
  console.log('Usage:\n  node send.js send <to> <subject> <body>\n  node send.js draft <to> <subject> <body>\n  node send.js inbox [count]');
}
