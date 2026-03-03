// Apollo.io People Enrichment — batch find emails for leads missing them
const https = require('https');
const { google } = require('googleapis');

const APOLLO_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

function apolloEnrich(firstName, lastName, domain) {
  const body = JSON.stringify({
    api_key: APOLLO_KEY,
    first_name: firstName,
    last_name: lastName,
    organization_name: domain,
    domain: domain,
    reveal_personal_emails: true,
  });
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.apollo.io',
      path: '/api/v1/people/match',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`Parse error: ${data.slice(0, 300)}`)); }
      });
    });
    req.on('error', reject);
    req.end(body);
  });
}

// Also try organization search to find BD/IR contacts
function apolloSearchPeople(domain, titles) {
  const body = JSON.stringify({
    api_key: APOLLO_KEY,
    q_organization_domains: domain,
    person_titles: titles,
    page: 1,
    per_page: 5,
  });
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.apollo.io',
      path: '/api/v1/mixed_people/search',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`Parse error: ${data.slice(0, 300)}`)); }
      });
    });
    req.on('error', reject);
    req.end(body);
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const GENERIC_PREFIXES = ['info@','ir@','deals@','contact','epteam@','press@','business','media@','compliance@','boston@','charlotte@','london@','pr@'];
const GENERIC_DOMAINS = ['sardverb.com','prosek.com','edelman.com','finnpartners.com','fgsglobal.com','joelefrank.com'];

function isGenericEmail(email) {
  if (!email) return true;
  const lower = email.toLowerCase();
  if (GENERIC_PREFIXES.some(p => lower.startsWith(p))) return true;
  if (GENERIC_DOMAINS.some(d => lower.includes(d))) return true;
  return false;
}

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: __dirname + '/service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:L200',
  });
  const rows = res.data.values;
  const header = rows[0];
  const cols = {};
  header.forEach((h, i) => cols[h] = i);

  let enriched = 0, found = 0, errors = 0;
  const results = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const email = (row[cols['Email']] || '').trim();
    const contact = (row[cols['Contact Name']] || '').trim();
    const website = (row[cols['Website']] || '').trim();
    const company = (row[cols['Company Name']] || '').trim();

    // Only process rows missing a direct email
    if (!isGenericEmail(email)) continue;
    if (!website) continue;

    let domain;
    try { domain = new URL(website).hostname.replace('www.', ''); } catch { continue; }

    // Parse first/last from contact name
    let firstName = '', lastName = '';
    if (contact && contact !== 'Not identified') {
      const primary = contact.split('/')[0].trim();
      const parts = primary.split(' ').filter(p => !['Dr.', 'Mr.', 'Mrs.', 'Ms.'].includes(p));
      if (parts.length >= 2) {
        firstName = parts[0];
        lastName = parts[parts.length - 1];
      }
    }

    console.log(`\n[${i}] ${company} (${domain}) — ${firstName} ${lastName}`);

    try {
      let foundEmail = null;
      let foundName = contact;
      let foundTitle = '';
      let method = '';

      // Strategy 1: Enrich by name + domain if we have a name
      if (firstName && lastName) {
        const result = await apolloEnrich(firstName, lastName, domain);
        enriched++;
        if (result.person && result.person.email) {
          foundEmail = result.person.email;
          foundTitle = result.person.title || '';
          method = 'apollo-enrich';
          console.log(`  FOUND (enrich): ${foundEmail} — ${foundTitle}`);
        } else {
          console.log(`  No match by name`);
        }
        await sleep(500);
      }

      // Strategy 2: Search for BD/IR/Partner contacts at the domain
      if (!foundEmail) {
        const searchRes = await apolloSearchPeople(domain, [
          'Business Development', 'Investor Relations', 'Managing Partner',
          'Partner', 'Managing Director', 'Vice President'
        ]);
        enriched++;
        if (searchRes.people && searchRes.people.length > 0) {
          // Find one with an email
          const withEmail = searchRes.people.find(p => p.email);
          if (withEmail) {
            foundEmail = withEmail.email;
            foundName = `${withEmail.first_name} ${withEmail.last_name}`;
            foundTitle = withEmail.title || '';
            method = 'apollo-search';
            console.log(`  FOUND (search): ${foundEmail} — ${foundName}, ${foundTitle}`);
          } else {
            console.log(`  Found ${searchRes.people.length} people but no emails`);
          }
        } else {
          console.log(`  No people found at domain`);
        }
        await sleep(500);
      }

      if (foundEmail && !isGenericEmail(foundEmail)) {
        found++;
        results.push({ row: i + 1, company, email: foundEmail, name: foundName, title: foundTitle, method });

        // Update sheet
        const updates = [];
        // Update email
        updates.push({
          range: `Sheet1!${String.fromCharCode(65 + cols['Email'])}${i + 1}`,
          values: [[foundEmail]]
        });
        // Update contact name if we found someone different
        if (method === 'apollo-search' && foundName !== contact) {
          updates.push({
            range: `Sheet1!${String.fromCharCode(65 + cols['Contact Name'])}${i + 1}`,
            values: [[foundName]]
          });
          if (foundTitle) {
            updates.push({
              range: `Sheet1!${String.fromCharCode(65 + cols['Title'])}${i + 1}`,
              values: [[foundTitle]]
            });
          }
        }
        // Append to notes
        const currentNotes = (row[cols['Notes']] || '');
        const note = ` Apollo.io ${method}: ${foundEmail} (${foundName}, ${foundTitle}). 2026-02-16.`;
        updates.push({
          range: `Sheet1!${String.fromCharCode(65 + cols['Notes'])}${i + 1}`,
          values: [[currentNotes + note]]
        });

        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: SHEET_ID,
          resource: { valueInputOption: 'RAW', data: updates }
        });
        console.log(`  ✅ Sheet updated row ${i + 1}`);
      }

    } catch (err) {
      errors++;
      console.error(`  ERROR: ${err.message}`);
      if (err.message.includes('429') || err.message.includes('rate')) {
        console.log('  Rate limited, waiting 10s...');
        await sleep(10000);
      }
    }

    await sleep(800);
  }

  console.log(`\n========== SUMMARY ==========`);
  console.log(`API calls: ${enriched}`);
  console.log(`Emails found: ${found}`);
  console.log(`Errors: ${errors}`);
  console.log(`\nResults:`);
  results.forEach(r => console.log(`  ${r.company}: ${r.email} (${r.name}, ${r.title}) [${r.method}]`));
}

main().catch(console.error);
