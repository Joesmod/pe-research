const path = require('path');
const https = require('https');
const dir = path.join(__dirname, 'gmail-outreach');
const {google} = require(path.join(dir, 'node_modules', 'googleapis'));
const {JWT} = require(path.join(dir, 'node_modules', 'google-auth-library'));
const creds = require(path.join(dir, 'service-account.json'));
const auth = new JWT({email: creds.client_email, key: creds.private_key, scopes: ['https://www.googleapis.com/auth/spreadsheets']});
const sheets = google.sheets({version:'v4', auth});
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

function post(apiPath, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.apollo.io', path: apiPath, method: 'POST',
      headers: {'Content-Type':'application/json','X-Api-Key':API_KEY,'Content-Length':Buffer.byteLength(data)}
    }, res => {
      let b=''; res.on('data',c=>b+=c); res.on('end',()=>{try{resolve({status:res.statusCode,...JSON.parse(b)})}catch(e){resolve({status:res.statusCode,raw:b.slice(0,200)})}});
    });
    req.on('error', reject);
    req.write(data); req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Target rows to upgrade (1-indexed sheet rows) - media/IR/press contacts with low scores
const TARGETS = [
  { row: 52, name: 'Summit Partners', reason: 'Susan Barr is Media - need decision-maker' },
  { row: 62, name: 'Advent International', reason: 'Leslie Shribman is Comms - need decision-maker' },
  { row: 73, name: 'Transom Capital Group', reason: 'Dana Goldstein is IR/Marketing - need ops/tech' },
  { row: 92, name: 'Webster Equity Partners', reason: 'Amanda Maynord is Media - need decision-maker' },
  { row: 135, name: 'Leeds Equity Partners', reason: 'Danielle Derrico is CAO - try for tech/ops' },
  { row: 87, name: 'Diversis Capital', reason: 'Score 9, Kevin Ma, but no verified email - try Apollo' },
  { row: 271, name: 'Broad Sky Partners', reason: 'Heidi Vanhamme is Media - need decision-maker' },
  { row: 61, name: 'BPOC (Beecken Petty OKeefe)', reason: 'Deborah Wahl is Press - need decision-maker' },
  { row: 47, name: 'GreyLion', reason: 'Jody Shechtman is generic Contact - need tech/ops' },
  { row: 48, name: 'Riverside Partners', reason: 'Steve Kaplan GP - try for tech/ops upgrade' },
  { row: 110, name: 'Sun Capital Partners', reason: 'Pia De Sousa is VP Marketing - need ops/tech' },
  { row: 95, name: 'Heritage Holding', reason: 'Has Brazilian email domain for Boston firm - likely wrong' },
];

const SENIOR_TITLES = [
  'Chief Technology Officer', 'CTO', 'Chief Information Officer', 'CIO',
  'Chief Digital Officer', 'CDO', 'Chief Operating Officer', 'COO',
  'Managing Partner', 'Managing Director', 'Partner',
  'Head of Portfolio Operations', 'Head of Value Creation',
  'VP Technology', 'VP Operations', 'VP Digital',
  'Director of Technology', 'Director of Operations',
  'Operating Partner', 'Principal',
  'CEO', 'President', 'Founder',
  'Head of Business Development', 'Director of Business Development',
  'Vice President Business Development'
];

async function main() {
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Sheet1!A1:M300' });
  const rows = res.data.values || [];
  console.log(`Loaded ${rows.length} rows. Processing ${TARGETS.length} upgrade targets...\n`);

  let upgraded = 0, failed = 0;

  for (const target of TARGETS) {
    const rowIdx = target.row - 1; // 0-indexed
    const row = rows[rowIdx];
    if (!row) { console.log(`Row ${target.row}: NOT FOUND`); continue; }
    
    const firmName = row[0];
    const currentContact = row[1] || '(none)';
    const currentEmail = row[3] || '(none)';
    console.log(`\n--- Row ${target.row}: ${firmName} ---`);
    console.log(`  Current: ${currentContact} | ${currentEmail}`);
    console.log(`  Reason: ${target.reason}`);

    try {
      // Step 1: Find org
      const orgSearch = await post('/api/v1/mixed_companies/search', {
        q_organization_name: firmName, per_page: 1, page: 1
      });
      await sleep(400);

      const org = orgSearch.organizations?.[0];
      if (!org) { console.log('  -> No org found in Apollo'); failed++; continue; }
      console.log(`  Org: ${org.name} (${org.id})`);

      // Step 2: Search for senior people
      const peopleSearch = await post('/api/v1/mixed_people/api_search', {
        organization_ids: [org.id],
        person_titles: SENIOR_TITLES,
        per_page: 5, page: 1
      });
      await sleep(400);

      if (!peopleSearch.people?.length) { console.log('  -> No people found'); failed++; continue; }
      console.log(`  Found ${peopleSearch.people.length} people`);

      // Step 3: Try to enrich each person until we get a verified email
      let bestPerson = null;
      for (const p of peopleSearch.people) {
        const enriched = await post('/api/v1/people/match', { id: p.id });
        await sleep(400);

        const person = enriched.person;
        if (!person) continue;

        const email = person.email;
        const name = `${person.first_name || ''} ${person.last_name || ''}`.trim();
        const title = person.title || '';
        const linkedin = person.linkedin_url || '';
        
        console.log(`  Checking: ${name} - ${title} - ${email || 'NO EMAIL'}`);
        
        if (email && !email.includes('info@') && !email.includes('sales@') && !email.includes('ir@')) {
          // Check if this is a better contact than current (tech/ops/BD preferred)
          const isDecisionMaker = /CTO|CIO|CDO|COO|CEO|technology|operations|digital|portfolio|value creation|business development/i.test(title);
          const isPartnerLevel = /partner|director|managing|principal|founder|president|head/i.test(title);
          
          if (isDecisionMaker || isPartnerLevel) {
            bestPerson = { name, title, email, linkedin };
            console.log(`  -> FOUND UPGRADE: ${name} (${title}) - ${email}`);
            break;
          }
          if (!bestPerson) {
            bestPerson = { name, title, email, linkedin };
          }
        }
      }

      if (bestPerson) {
        // Update the sheet
        const range = `Sheet1!B${target.row}:K${target.row}`;
        const currentNotes = row[10] || '';
        const newNotes = `UPGRADED from ${currentContact}. ${bestPerson.name} (${bestPerson.title}) verified via Apollo. 2026-02-20 enrichment.` + (currentNotes ? ' Previous: ' + currentNotes.substring(0, 200) : '');
        
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: range,
          valueInputOption: 'RAW',
          requestBody: {
            values: [[
              bestPerson.name,           // B: Contact Name
              bestPerson.title,          // C: Title
              bestPerson.email,          // D: Email
              row[4] || '',              // E: Website (keep)
              bestPerson.linkedin || row[5] || '', // F: LinkedIn
              row[6] || '',              // G: Sector Focus (keep)
              row[7] || '',              // H: Portfolio (keep)
              'Enriched',                // I: Status
              row[9] || '',              // J: Last Contacted (keep)
              newNotes                   // K: Notes
            ]]
          }
        });
        console.log(`  -> SHEET UPDATED!`);
        upgraded++;
      } else {
        console.log(`  -> No better contact found`);
        failed++;
      }

    } catch(e) {
      console.log(`  -> ERROR: ${e.message}`);
      failed++;
    }
  }

  console.log(`\n=== DONE: ${upgraded} upgraded, ${failed} failed ===`);
}

main().catch(e => console.error(e));
