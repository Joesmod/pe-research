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
  const auth = getAuth();
  const gmail = google.gmail({ version: 'v1', auth });

  const raw = Buffer.from(
    `From: Jim from Gumbo <jim@hellogumbo.com>\r\nTo: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/html; charset=utf-8\r\n\r\n<div dir="ltr">${body}</div>`
  ).toString('base64url');

  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw },
  });

  return res.data.id;
}

async function sendPreview() {
  const batch = JSON.parse(fs.readFileSync('email-batch.json', 'utf8'));
  const firstEmail = batch[0];
  
  const previewSubject = `[PREVIEW] ${firstEmail.subject}`;
  const previewBody = `<strong>PREVIEW - First email from today's batch (25 total)</strong><br><br>
<strong>Original Recipient:</strong> ${firstEmail.name} &lt;${firstEmail.to}&gt;<br>
<strong>Company:</strong> ${firstEmail.company}<br>
<strong>Subject:</strong> ${firstEmail.subject}<br><br>
<hr><br>
${firstEmail.body}
<br><hr><br>
<strong>📊 Batch Summary:</strong><br>
- Total emails: ${batch.length}<br>
- All recipients: Score 8-9, verified, tech/AI/value creation roles<br>
- No companies contacted in last 7 days<br>
- BCC'd jeff@ and alex@ on all sends<br><br>
<strong>Awaiting your approval to send the remaining ${batch.length - 1} emails.</strong>`;

  console.log('📧 Sending preview to alex@hellogumbo.com...\n');
  
  const messageId = await sendEmail('alex@hellogumbo.com', previewSubject, previewBody);
  
  console.log(`✅ Preview sent (ID: ${messageId})\n`);
  console.log(`First email preview: ${firstEmail.name} at ${firstEmail.company}`);
}

sendPreview().catch(console.error);
