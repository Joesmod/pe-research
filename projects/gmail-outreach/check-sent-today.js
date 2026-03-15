const { google } = require('googleapis');
const fs = require('fs');

async function checkSentToday() {
  // Load OAuth2 credentials (same as send.js uses)
  const creds = JSON.parse(fs.readFileSync('credentials.json'));
  const { client_id, client_secret } = creds.installed || creds.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, 'http://localhost:3000/callback');
  const tokens = JSON.parse(fs.readFileSync('token.json'));
  oAuth2Client.setCredentials(tokens);
  
  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
  
  // Search for sent messages from today (March 9, 2026)
  console.log('Checking sent mail for March 9, 2026...\n');
  
  const res = await gmail.users.messages.list({
    userId: 'me',
    q: 'in:sent after:2026/03/09',
    maxResults: 30
  });
  
  if (!res.data.messages || res.data.messages.length === 0) {
    console.log('❌ No emails sent on March 9, 2026');
    console.log('\nChecking last 10 sent messages...\n');
    
    const recentRes = await gmail.users.messages.list({
      userId: 'me',
      q: 'in:sent',
      maxResults: 10
    });
    
    for (const msg of recentRes.data.messages) {
      const detail = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'metadata',
        metadataHeaders: ['To', 'Subject', 'Date']
      });
      
      const headers = detail.data.payload.headers;
      const to = headers.find(h => h.name === 'To')?.value;
      const subject = headers.find(h => h.name === 'Subject')?.value;
      const date = headers.find(h => h.name === 'Date')?.value;
      
      console.log(`${date}`);
      console.log(`  To: ${to}`);
      console.log(`  Subject: ${subject}\n`);
    }
    return;
  }
  
  console.log(`✅ Found ${res.data.messages.length} emails sent on March 9, 2026:\n`);
  
  const contacts = [];
  
  for (const msg of res.data.messages) {
    const detail = await gmail.users.messages.get({
      userId: 'me',
      id: msg.id,
      format: 'metadata',
      metadataHeaders: ['To', 'Subject', 'Date']
    });
    
    const headers = detail.data.payload.headers;
    const to = headers.find(h => h.name === 'To')?.value;
    const subject = headers.find(h => h.name === 'Subject')?.value;
    const date = headers.find(h => h.name === 'Date')?.value;
    
    console.log(`${date}`);
    console.log(`  To: ${to}`);
    console.log(`  Subject: ${subject}\n`);
    
    contacts.push({ to, subject, date });
  }
  
  console.log(`\nTotal sent today: ${contacts.length}`);
}

checkSentToday().catch(console.error);
