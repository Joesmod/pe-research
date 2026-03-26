const https = require('https');
const {google} = require('googleapis');

const APOLLO_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const TARGET_TITLES = ['Operating Partner', 'Managing Partner', 'Managing Director', 'Partner'];
const MAX_CONTACTS_PER_FIRM = 3;
const BATCH_SIZE = 50;

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

async function getContacts(companyName) {
  const searchRes = await apolloPost('/v1/mixed_people/api_search', {
    q_organization_name: companyName,
    person_titles: TARGET_TITLES,
    page: 1, per_page: 10
  });

  if (!searchRes.people || searchRes.people.length === 0) return [];

  const contacts = [];
  for (const person of searchRes.people) {
    if (contacts.length >= MAX_CONTACTS_PER_FIRM) break;
    try {
      await sleep(400);
      const matchRes = await apolloPost('/v1/people/match', { id: person.id, reveal_personal_emails: false });
      if (matchRes.person) {
        const p = matchRes.person;
        contacts.push({
          name: p.name || `${p.first_name || ''} ${p.last_name || ''}`.trim(),
          title: p.title || '',
          email: p.email || '',
          emailStatus: p.email_status || '',
          linkedin: p.linkedin_url || ''
        });
      }
    } catch (e) { /* skip */ }
  }
  return contacts;
}

async function main() {
  const auth = new google.auth.GoogleAuth({ keyFile: 'service-account.json', scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });

  // Read all rows
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Sheet1!A1:M841' });
  const rows = res.data.values;

  // Find firms without contacts, sort by score desc, pick top 50
  const candidates = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const hasEmail = !!(r[3] || '').trim();
    if (hasEmail) continue;
    const score = parseInt(r[12]) || 0;
    const hasWebsite = !!(r[4] || '').trim();
    candidates.push({ row: i + 1, company: r[0] || '', score, hasWebsite: hasWebsite ? 1 : 0 });
  }
  candidates.sort((a, b) => b.score - a.score || b.hasWebsite - a.hasWebsite);
  const batch = candidates.slice(0, BATCH_SIZE);

  console.log(`Selected ${batch.length} firms for enrichment\n`);

  // Ensure Contacts sheet exists
  try {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: { requests: [{ addSheet: { properties: { title: 'Contacts' } } }] }
    });
    // Write header
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID, range: 'Contacts!A1:G1',
      valueInputOption: 'RAW',
      requestBody: { values: [['Company', 'CRM Row', 'Contact Name', 'Title', 'Email', 'Email Status', 'LinkedIn']] }
    });
  } catch (e) {
    // Sheet exists — check if it has data, append after existing
  }

  let contactRows = [];
  let totalWithEmail = 0;
  let totalContacts = 0;
  let firmsDone = 0;

  for (const firm of batch) {
    firmsDone++;
    console.log(`[${firmsDone}/${batch.length}] ${firm.company} (score: ${firm.score})`);

    try {
      const contacts = await getContacts(firm.company);
      console.log(`  → ${contacts.length} contacts found`);

      if (contacts.length === 0) {
        contactRows.push([firm.company, firm.row, '', '', 'NO RESULTS', '', '']);
      } else {
        for (const c of contacts) {
          contactRows.push([firm.company, firm.row, c.name, c.title, c.email || 'NO EMAIL', c.emailStatus, c.linkedin]);
          if (c.email) totalWithEmail++;
          totalContacts++;
        }
      }

      // Also update main sheet: put best contact with email into columns B-D, F
      const best = contacts.find(c => c.email) || contacts[0];
      if (best && best.email) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID, range: `Sheet1!B${firm.row}:D${firm.row}`,
          valueInputOption: 'RAW',
          requestBody: { values: [[best.name, best.title, best.email]] }
        });
        if (best.linkedin) {
          await sheets.spreadsheets.values.update({
            spreadsheetId: SHEET_ID, range: `Sheet1!F${firm.row}`,
            valueInputOption: 'RAW', requestBody: { values: [[best.linkedin]] }
          });
        }
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID, range: `Sheet1!I${firm.row}`,
          valueInputOption: 'RAW', requestBody: { values: [['Enriched']] }
        });
      }
    } catch (err) {
      console.log(`  ❌ ${err.message}`);
      contactRows.push([firm.company, firm.row, '', '', `ERROR`, '', '']);
    }

    // Flush every 10 firms
    if (contactRows.length >= 20 || firmsDone === batch.length) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID, range: 'Contacts!A2',
        valueInputOption: 'RAW',
        requestBody: { values: contactRows }
      });
      console.log(`  [Flushed ${contactRows.length} rows to Contacts sheet]`);
      contactRows = [];
    }

    await sleep(1500);
  }

  console.log(`\n=== DONE ===`);
  console.log(`Firms processed: ${firmsDone}`);
  console.log(`Total contacts: ${totalContacts}`);
  console.log(`With email: ${totalWithEmail}`);
}

main().catch(e => console.error(e));
