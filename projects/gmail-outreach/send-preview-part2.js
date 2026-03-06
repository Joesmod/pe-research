const fs = require('fs');
const { google } = require('googleapis');

async function sendPreview() {
  const creds = JSON.parse(fs.readFileSync('credentials.json'));
  const { client_id, client_secret } = creds.installed || creds.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, 'http://localhost:3000/callback');
  const tokens = JSON.parse(fs.readFileSync('token.json'));
  oAuth2Client.setCredentials(tokens);
  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

  const batch = JSON.parse(fs.readFileSync('email-batch-part2.json'));
  const first = batch[0];

  const emailBody = `<div dir="ltr"><strong>Preview for: ${first.name} (${first.company})</strong><br><br>${first.body}<br><br><hr><br><em>This is a preview of the first email in a 15-email batch. If approved, all 15 will be sent with BCC to jeff@ and alex@.</em></div>`;

  const raw = Buffer.from(
    `From: Jim from Gumbo <jim@hellogumbo.com>\r\nTo: alex@hellogumbo.com\r\nSubject: [PREVIEW] ${first.subject}\r\nContent-Type: text/html; charset=utf-8\r\n\r\n${emailBody}`
  ).toString('base64url');

  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw }
  });

  console.log(`Preview sent to alex@hellogumbo.com (ID: ${res.data.id})`);
}

sendPreview().catch(console.error);
