const fs = require('fs');
const { google } = require('googleapis');

const CREDS_PATH = __dirname + '/credentials.json';
const TOKEN_PATH = __dirname + '/token.json';

async function checkRecentSent(maxResults = 5) {
  const creds = JSON.parse(fs.readFileSync(CREDS_PATH));
  const { client_id, client_secret } = creds.installed || creds.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, 'http://localhost:3000/callback');
  const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH));
  oAuth2Client.setCredentials(tokens);

  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

  const res = await gmail.users.messages.list({
    userId: 'me',
    maxResults,
    labelIds: ['SENT'],
  });

  if (!res.data.messages) {
    console.log('No sent messages found');
    return [];
  }

  const results = [];
  for (const m of res.data.messages) {
    const detail = await gmail.users.messages.get({ 
      userId: 'me', 
      id: m.id, 
      format: 'full' 
    });
    
    const headers = detail.data.payload.headers;
    const to = headers.find(h => h.name === 'To')?.value;
    const subject = headers.find(h => h.name === 'Subject')?.value;
    const date = headers.find(h => h.name === 'Date')?.value;
    
    // Get body
    let body = '';
    if (detail.data.payload.parts) {
      const htmlPart = detail.data.payload.parts.find(p => p.mimeType === 'text/html');
      if (htmlPart && htmlPart.body.data) {
        body = Buffer.from(htmlPart.body.data, 'base64').toString('utf-8');
      }
    } else if (detail.data.payload.body.data) {
      body = Buffer.from(detail.data.payload.body.data, 'base64').toString('utf-8');
    }
    
    // Check for truncation signs
    const bodyLength = body.length;
    const isTruncated = bodyLength < 500 || !body.includes('Jim Jensen') || !body.includes('hellogumbo.com');
    
    results.push({
      to,
      subject,
      date,
      bodyLength,
      isTruncated,
      bodyPreview: body.substring(0, 300) + '...',
      fullBody: body
    });
  }

  return results;
}

checkRecentSent(5).then(results => {
  console.log(JSON.stringify(results, null, 2));
}).catch(console.error);
