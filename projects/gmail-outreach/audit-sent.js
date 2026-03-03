const fs = require('fs');
const { google } = require('googleapis');

const c = JSON.parse(fs.readFileSync(__dirname + '/credentials.json'));
const { client_id, client_secret } = c.installed || c.web;
const a = new google.auth.OAuth2(client_id, client_secret, 'http://localhost:3000/callback');
a.setCredentials(JSON.parse(fs.readFileSync(__dirname + '/token.json')));
const g = google.gmail({ version: 'v1', auth: a });

(async () => {
  // Get all sent messages
  let allMessages = [];
  let pageToken;
  do {
    const r = await g.users.messages.list({ userId: 'me', maxResults: 100, labelIds: ['SENT'], pageToken });
    if (r.data.messages) allMessages.push(...r.data.messages);
    pageToken = r.data.nextPageToken;
  } while (pageToken);

  console.log(`Total sent messages: ${allMessages.length}`);

  // Fetch headers for each
  const results = [];
  for (const m of allMessages) {
    const d = await g.users.messages.get({ userId: 'me', id: m.id, format: 'metadata', metadataHeaders: ['To', 'Subject', 'Date'] });
    const h = d.data.payload.headers;
    results.push({
      id: m.id,
      to: h.find(x => x.name === 'To')?.value || '',
      subject: h.find(x => x.name === 'Subject')?.value || '',
      date: h.find(x => x.name === 'Date')?.value || '',
    });
  }

  // Find duplicates by recipient email
  const byRecipient = {};
  for (const r of results) {
    // Extract email from "Name <email>" format
    const match = r.to.match(/<([^>]+)>/) || [null, r.to];
    const email = (match[1] || r.to).toLowerCase().trim();
    if (!byRecipient[email]) byRecipient[email] = [];
    byRecipient[email].push({ date: r.date, subject: r.subject, id: r.id });
  }

  // Show duplicates
  console.log('\n=== DUPLICATE RECIPIENTS ===');
  let dupeCount = 0;
  for (const [email, msgs] of Object.entries(byRecipient)) {
    if (msgs.length > 1) {
      dupeCount++;
      console.log(`\n${email} (${msgs.length} emails):`);
      for (const m of msgs) {
        console.log(`  - ${m.date} | ${m.subject}`);
      }
    }
  }
  if (dupeCount === 0) console.log('No duplicates found!');
  else console.log(`\n${dupeCount} recipients received multiple emails.`);
})();
