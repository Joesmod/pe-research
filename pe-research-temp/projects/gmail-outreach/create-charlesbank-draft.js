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

async function main() {
  const auth = getAuth();
  const gmail = google.gmail({ version: 'v1', auth });

  const to = 'sbarrad@charlesbank.com';
  const subject = 'RE: Implementation Partner for Charlesbank Portfolio AI Rollouts';
  const htmlBody = `Sherif,<br><br>Thanks for getting back to us -- great to connect. I'm attaching our capabilities deck for your review.<br><br>Happy to have Sarah coordinate a 30-minute call in mid-March to walk through how we've been working with firms like Charlesbank. What weeks work best on your end?<br><br>Looking forward to it.<br><br>Jim<br><a href="https://hellogumbo.com">Gumbo</a>`;

  const bcc = 'jeff@hellogumbo.com, alex@hellogumbo.com';

  const raw = Buffer.from(
    `From: Jim from Gumbo <jim@hellogumbo.com>\r\nTo: ${to}\r\nBcc: ${bcc}\r\nSubject: ${subject}\r\nContent-Type: text/html; charset=utf-8\r\n\r\n<div dir="ltr">${htmlBody}</div>`
  ).toString('base64url');

  const res = await gmail.users.drafts.create({
    userId: 'me',
    requestBody: { message: { raw } },
  });

  console.log('Draft created:', res.data.id);
  console.log('Message ID:', res.data.message?.id);
}

main().catch(console.error);
