const { google } = require('googleapis');
const fs = require('fs');

function getAuth() {
  const creds = JSON.parse(fs.readFileSync(__dirname + '/credentials.json'));
  const { client_id, client_secret } = creds.installed || creds.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, 'http://localhost:3000/callback');
  const tokens = JSON.parse(fs.readFileSync(__dirname + '/token.json'));
  oAuth2Client.setCredentials(tokens);
  return oAuth2Client;
}

async function run() {
  const gmail = google.gmail({ version: 'v1', auth: getAuth() });
  
  const res = await gmail.users.messages.list({
    userId: 'me',
    q: 'to:alex@hellogumbo.com subject:"AI infrastructure"',
    maxResults: 1
  });
  
  const messages = res.data.messages || [];
  if (messages.length === 0) {
    console.log('No matching email found');
    return;
  }
  
  const full = await gmail.users.messages.get({
    userId: 'me',
    id: messages[0].id,
    format: 'full'
  });
  
  const headers = full.data.payload.headers;
  const to = headers.find(h => h.name === 'To')?.value || '';
  const subject = headers.find(h => h.name === 'Subject')?.value || '';
  const date = headers.find(h => h.name === 'Date')?.value || '';
  
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Date: ${date}`);
  console.log('');
  
  // Get body
  let body = '';
  if (full.data.payload.body.data) {
    body = Buffer.from(full.data.payload.body.data, 'base64').toString();
  } else if (full.data.payload.parts) {
    for (const part of full.data.payload.parts) {
      if (part.mimeType === 'text/html' || part.mimeType === 'text/plain') {
        body = Buffer.from(part.body.data, 'base64').toString();
        break;
      }
    }
  }
  
  console.log('Body:');
  console.log(body.substring(0, 1000));
}

run().catch(console.error);
