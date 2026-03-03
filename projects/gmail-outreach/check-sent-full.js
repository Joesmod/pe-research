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

async function getSentEmail(index = 1) {
  const auth = getAuth();
  const gmail = google.gmail({ version: 'v1', auth });

  const res = await gmail.users.messages.list({
    userId: 'me',
    maxResults: index,
    labelIds: ['SENT'],
  });

  if (!res.data.messages || res.data.messages.length < index) {
    console.log('Email not found');
    return null;
  }

  const messageId = res.data.messages[index - 1].id;
  const detail = await gmail.users.messages.get({ 
    userId: 'me', 
    id: messageId, 
    format: 'full'
  });
  
  const headers = detail.data.payload.headers;
  const to = headers.find(h => h.name === 'To')?.value;
  const subject = headers.find(h => h.name === 'Subject')?.value;
  const date = headers.find(h => h.name === 'Date')?.value;
  
  // Get the body content
  let body = '';
  if (detail.data.payload.parts) {
    const htmlPart = detail.data.payload.parts.find(p => p.mimeType === 'text/html');
    if (htmlPart && htmlPart.body.data) {
      body = Buffer.from(htmlPart.body.data, 'base64').toString('utf-8');
    }
  } else if (detail.data.payload.body.data) {
    body = Buffer.from(detail.data.payload.body.data, 'base64').toString('utf-8');
  }
  
  return { to, subject, date, body };
}

const index = parseInt(process.argv[2]) || 1;
getSentEmail(index).then(msg => {
  if (msg) {
    console.log(`To: ${msg.to}`);
    console.log(`Subject: ${msg.subject}`);
    console.log(`Date: ${msg.date}`);
    console.log(`\n=== FULL HTML BODY ===\n`);
    console.log(msg.body);
  }
}).catch(console.error);
