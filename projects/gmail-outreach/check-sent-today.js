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
  
  // Get today's date in YYYY/MM/DD format for Gmail query
  const today = new Date();
  const dateStr = `${today.getFullYear()}/${(today.getMonth()+1).toString().padStart(2,'0')}/${today.getDate().toString().padStart(2,'0')}`;
  
  console.log(`Searching for emails sent on ${dateStr}...`);
  
  const res = await gmail.users.messages.list({
    userId: 'me',
    q: `in:sent after:${dateStr}`,
    maxResults: 50
  });
  
  const messages = res.data.messages || [];
  console.log(`\nFound ${messages.length} sent emails today:\n`);
  
  for (const msg of messages) {
    const full = await gmail.users.messages.get({
      userId: 'me',
      id: msg.id,
      format: 'full'
    });
    
    const headers = full.data.payload.headers;
    const to = headers.find(h => h.name === 'To')?.value || '';
    const subject = headers.find(h => h.name === 'Subject')?.value || '';
    const date = headers.find(h => h.name === 'Date')?.value || '';
    
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Date: ${date}`);
    console.log('---');
  }
}

run().catch(console.error);
