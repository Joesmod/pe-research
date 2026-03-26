const https = require('https');
const {google} = require('googleapis');

const APOLLO_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

function apolloPost(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const opts = {
      hostname: 'api.apollo.io', path, method: 'POST',
      headers: { 'x-api-key': APOLLO_KEY, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    };
    const req = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch(e) { reject(new Error(d)); } });
    });
    req.on('error', reject);
    req.write(data); req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function getMultipleContacts(companyName) {
  // Search for senior people - get up to 10
  const searchRes = await apolloPost('/v1/mixed_people/api_search', {
    q_organization_name: companyName,
    person_titles: [
      'Managing Director', 'Partner', 'Principal', 'CEO', 'President',
      'VP Business Development', 'Head of Business Development', 'Managing Partner',
      'Senior Partner', 'Co-Founder', 'Founder', 'Chief Operating Officer', 'COO',
      'VP Operations', 'Head of Technology', 'CTO', 'Chief Technology Officer',
      'VP Technology', 'Director of Technology', 'Head of Digital',
      'VP Portfolio Operations', 'Operating Partner', 'Head of Portfolio',
      'Director Business Development', 'VP Investments'
    ],
    page: 1, per_page: 10
  });

  if (!searchRes.people || searchRes.people.length === 0) return [];

  const contacts = [];
  // Reveal each person with email
  for (const person of searchRes.people) {
    try {
      await sleep(400);
      const matchRes = await apolloPost('/v1/people/match', { id: person.id, reveal_personal_emails: false });
      if (matchRes.person) {
        const p = matchRes.person;
        if (p.email) {
          contacts.push({
            name: p.name || `${p.first_name || ''} ${p.last_name || ''}`.trim(),
            title: p.title || '',
            email: p.email,
            emailStatus: p.email_status || '',
            linkedin: p.linkedin_url || ''
          });
        }
      }
    } catch (e) {
      // skip individual errors
    }
  }
  return contacts;
}

async function main() {
  const auth = new google.auth.GoogleAuth({ keyFile: 'service-account.json', scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });

  // Read main sheet
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Sheet1!A1:M200' });
  const rows = res.data.values;

  // Build company list sorted by score (high first), skip score <= 3
  const companies = [];
  for (let i = 1; i < rows.length; i++) {
    const score = parseInt(rows[i][12]) || 0;
    if (score >= 5) {
      companies.push({ row: i + 1, company: rows[i][0] || '', score });
    }
  }
  companies.sort((a, b) => b.score - a.score);

  console.log(`Processing ${companies.length} companies (score >= 5), sorted by score desc`);

  // Create/clear Contacts sheet
  try {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: { requests: [{ addSheet: { properties: { title: 'Contacts' } } }] }
    });
    console.log('Created Contacts sheet');
  } catch (e) {
    // Sheet exists, clear it
    await sheets.spreadsheets.values.clear({ spreadsheetId: SHEET_ID, range: 'Contacts!A:F' });
    console.log('Cleared existing Contacts sheet');
  }

  // Write header
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID, range: 'Contacts!A1:G1',
    valueInputOption: 'RAW',
    requestBody: { values: [['Company', 'Gumbo Score', 'Contact Name', 'Title', 'Email', 'Email Status', 'LinkedIn']] }
  });

  let allContacts = [];
  let totalEmails = 0;

  for (let idx = 0; idx < companies.length; idx++) {
    const { company, score } = companies[idx];
    console.log(`[${idx + 1}/${companies.length}] (Score: ${score}) ${company}`);

    try {
      const contacts = await getMultipleContacts(company);
      console.log(`  → ${contacts.length} contacts with emails`);

      for (const c of contacts) {
        allContacts.push([company, score, c.name, c.title, c.email, c.emailStatus, c.linkedin]);
        totalEmails++;
      }

      if (contacts.length === 0) {
        allContacts.push([company, score, '', '', 'NO CONTACTS FOUND', '', '']);
      }
    } catch (err) {
      console.log(`  ❌ Error: ${err.message}`);
      allContacts.push([company, score, '', '', `ERROR: ${err.message}`, '', '']);
    }

    // Batch write every 10 companies to avoid losing data
    if (allContacts.length >= 50 || idx === companies.length - 1) {
      const startRow = totalEmails - allContacts.length + 2; // +2 for header + 1-indexed
      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID, range: 'Contacts!A2',
        valueInputOption: 'RAW',
        requestBody: { values: allContacts }
      });
      console.log(`  [Wrote ${allContacts.length} rows to sheet]`);
      allContacts = [];
    }

    await sleep(1500); // rate limit between companies
  }

  console.log(`\n=== DONE ===`);
  console.log(`Total emails found: ${totalEmails}`);
}

main().catch(e => console.error(e));
