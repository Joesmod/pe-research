const fs = require('fs');
const {google} = require('googleapis');

const CREDS_PATH = __dirname + '/credentials.json';
const TOKEN_PATH = __dirname + '/token.json';

function getAuth() {
  const creds = JSON.parse(fs.readFileSync(CREDS_PATH));
  const {client_id, client_secret} = creds.installed || creds.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, 'http://localhost:3000/callback');
  const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH));
  oAuth2Client.setCredentials(tokens);
  return oAuth2Client;
}

(async () => {
  const auth = getAuth();
  const gmail = google.gmail({version: 'v1', auth});
  
  // Get all sent messages
  const res = await gmail.users.messages.list({
    userId: 'me',
    q: 'from:jim@hellogumbo.com',
    maxResults: 500
  });
  
  console.log('Total sent messages:', res.data.messages?.length || 0);
  
  if (!res.data.messages) {
    console.log('No sent messages found.');
    return;
  }
  
  // Get details for all messages
  const messages = await Promise.all(
    res.data.messages.map(async msg => {
      const full = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'metadata',
        metadataHeaders: ['To', 'Subject', 'Date']
      });
      
      const headers = full.data.payload.headers;
      const to = headers.find(h => h.name === 'To')?.value || '';
      const subject = headers.find(h => h.name === 'Subject')?.value || '';
      const date = headers.find(h => h.name === 'Date')?.value || '';
      
      return {date, to, subject};
    })
  );
  
  // Save to JSON
  fs.writeFileSync('sent-emails.json', JSON.stringify(messages, null, 2));
  console.log(`\nSaved ${messages.length} sent emails to sent-emails.json`);
  
  // Show first 10
  console.log('\nFirst 10 sent emails:');
  messages.slice(0, 10).forEach(m => {
    console.log(`${m.date} | ${m.to} | ${m.subject}`);
  });
})().catch(e => console.error(e.message));
