const fs = require('fs');
const { google } = require('googleapis');

async function sendPreview() {
  const creds = JSON.parse(fs.readFileSync('credentials.json'));
  const { client_id, client_secret } = creds.installed || creds.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, 'http://localhost:3000/callback');
  const tokens = JSON.parse(fs.readFileSync('token.json'));
  oAuth2Client.setCredentials(tokens);
  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

  const batch = JSON.parse(fs.readFileSync('email-batch.json'));
  const first = batch[0];

  const preview = `<div dir="ltr">
    <strong>[CLEAN BATCH] PE Outreach 2026-03-05</strong><br><br>
    <strong>✅ ALL 25 COMPANIES VERIFIED:</strong><br>
    • Zero prior contact at company level<br>
    • All have verified emails in CRM<br>
    • Gumbo Score ≥ 8<br><br>
    <strong>Preview of first email:</strong><br><br>
    <strong>To:</strong> ${first.to} (${first.name}, ${first.company})<br>
    <strong>Subject:</strong> ${first.subject}<br><br>
    ${first.body}<br><br>
    <hr><br>
    <strong>Full batch (25 companies):</strong><br>
    ${batch.map((e, i) => `${i + 1}. ${e.company} - ${e.name}`).join('<br>')}<br><br>
    <em>If approved, will send all 25 emails with BCC to jeff@ and alex@.</em>
  </div>`;

  const raw = Buffer.from(
    `From: Jim from Gumbo <jim@hellogumbo.com>\r\nTo: alex@hellogumbo.com\r\nSubject: [CLEAN BATCH] PE Outreach 2026-03-05\r\nContent-Type: text/html; charset=utf-8\r\n\r\n${preview}`
  ).toString('base64url');

  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw }
  });

  console.log(`Clean batch preview sent to alex@hellogumbo.com (ID: ${res.data.id})`);
}

sendPreview().catch(console.error);
