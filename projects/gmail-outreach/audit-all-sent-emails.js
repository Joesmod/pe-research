const { google } = require('googleapis');
const fs = require('fs');

async function auditAllSentEmails() {
  // Load OAuth2 credentials
  const creds = JSON.parse(fs.readFileSync('credentials.json'));
  const { client_id, client_secret } = creds.installed || creds.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, 'http://localhost:3000/callback');
  const tokens = JSON.parse(fs.readFileSync('token.json'));
  oAuth2Client.setCredentials(tokens);
  
  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
  
  console.log('FULL EMAIL AUDIT - All Sent PE Outreach\n');
  console.log('Fetching all sent messages from jim@hellogumbo.com...\n');
  
  // Get all sent messages
  const res = await gmail.users.messages.list({
    userId: 'me',
    q: 'in:sent from:jim@hellogumbo.com -subject:lemwarmup',
    maxResults: 200
  });
  
  if (!res.data.messages || res.data.messages.length === 0) {
    console.log('No sent messages found');
    return [];
  }
  
  console.log(`Found ${res.data.messages.length} sent messages\n`);
  console.log('Extracting PE firm emails...\n');
  
  const peEmails = [];
  
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
    const dateStr = headers.find(h => h.name === 'Date')?.value;
    
    // Skip if it's to internal emails or test emails
    if (to.includes('@hellogumbo.com') || to.includes('aljensen92@gmail.com')) continue;
    
    // Parse date
    const date = new Date(dateStr);
    const isoDate = date.toISOString();
    
    peEmails.push({
      to,
      subject,
      date: isoDate,
      dateStr
    });
  }
  
  // Sort by date descending
  peEmails.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  console.log(`Found ${peEmails.length} PE outreach emails\n`);
  console.log('Recent sent emails:\n');
  
  peEmails.slice(0, 50).forEach((email, idx) => {
    console.log(`${idx + 1}. ${email.dateStr}`);
    console.log(`   To: ${email.to}`);
    console.log(`   Subject: ${email.subject}\n`);
  });
  
  // Save to file for CRM cross-reference
  fs.writeFileSync('sent-emails-audit.json', JSON.stringify(peEmails, null, 2));
  console.log(`\n✅ Saved ${peEmails.length} emails to sent-emails-audit.json`);
  
  return peEmails;
}

auditAllSentEmails().catch(console.error);
