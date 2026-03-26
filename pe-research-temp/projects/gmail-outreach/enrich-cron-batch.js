const axios = require('axios');
const { google } = require('googleapis');
const fs = require('fs');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const APOLLO_URL = 'https://api.apollo.io/v1';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Target firms to enrich (indices from enrichment-targets.json)
const TARGET_FIRMS = [
  { index: 306, company: 'Argonaut Private Equity' },
  { index: 328, company: 'Pritzker Group Private Capital' },
  { index: 337, company: 'Frontenac Company' },
  { index: 367, company: 'Calvert Street Investment Partners' },
  { index: 368, company: 'Caprae Capital Partners' },
  { index: 373, company: 'Infinity Capital Partners' },
  { index: 455, company: 'Cambridge Capital LLC' },
  { index: 477, company: 'Palm Beach Capital' },
  { index: 484, company: 'Stronghold Investment Management' },
  { index: 499, company: 'Aurora Capital Partners' },
  { index: 509, company: 'Edgewater Capital Partners' },
  { index: 510, company: 'Emerging Capital Partners - ECP' },
];

async function searchPeople(firmName) {
  try {
    // Step 1: Search for senior people
    const searchRes = await axios.post(
      `${APOLLO_URL}/mixed_people/api_search`,
      {
        q_organization_name: firmName,
        page: 1,
        per_page: 5,
        person_titles: [
          'Managing Director',
          'Partner',
          'Managing Partner',
          'Principal',
          'CEO',
          'President',
          'COO',
          'CTO',
          'VP Business Development',
          'VP Technology',
          'VP Operations',
          'Head of Operations',
          'Director of Technology'
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );

    const people = searchRes.data.people || [];
    if (people.length === 0) return [];

    // Step 2: Pick best candidate (prefer has_email=true)
    let candidate = people.find(p => p.has_email) || people[0];
    
    // Step 3: Reveal full details via match
    await new Promise(resolve => setTimeout(resolve, 500));
    const matchRes = await axios.post(
      `${APOLLO_URL}/people/match`,
      {
        id: candidate.id,
        reveal_personal_emails: false
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );

    if (!matchRes.data || !matchRes.data.person) return [];

    const person = matchRes.data.person;
    return [{
      name: person.name || `${person.first_name} ${person.last_name}`,
      title: person.title || '',
      email: person.email || null,
      email_status: person.email_status || '',
      linkedin_url: person.linkedin_url || ''
    }];
  } catch (error) {
    console.error(`Error searching for ${firmName}:`, error.response?.data || error.message);
    return [];
  }
}

async function updateSheet(updates) {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  for (const update of updates) {
    if (update.email) {
      // Full update with email
      const range = `Sheet1!B${update.rowIndex}:F${update.rowIndex}`;
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[
            update.contactName,
            update.title,
            update.email,
            '', // website
            update.linkedin || ''
          ]]
        }
      });
      console.log(`✓ Updated row ${update.rowIndex}: ${update.contactName} + email`);

      // Update status to Enriched
      const statusRange = `Sheet1!I${update.rowIndex}`;
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: statusRange,
        valueInputOption: 'RAW',
        requestBody: {
          values: [['Enriched']]
        }
      });
    } else if (update.partial) {
      // Partial update: name and title only
      const range = `Sheet1!B${update.rowIndex}:C${update.rowIndex}`;
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[
            update.contactName,
            update.title
          ]]
        }
      });
      console.log(`✓ Updated row ${update.rowIndex}: ${update.contactName} (name/title only)`);
      
      // Optionally update LinkedIn
      if (update.linkedin) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `Sheet1!F${update.rowIndex}`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [[update.linkedin]]
          }
        });
      }
    }
  }
}

async function main() {
  console.log('=== PE ENRICHMENT CRON RUN ===');
  console.log(`Time: ${new Date().toISOString()}\n`);

  const updates = [];
  const log = [];

  for (const target of TARGET_FIRMS) {
    console.log(`\nSearching ${target.company}...`);
    const people = await searchPeople(target.company);

    if (people.length > 0) {
      const person = people[0];
      const email = person.email;
      const name = person.name;
      const title = person.title;
      const linkedin = person.linkedin_url;
      const emailStatus = person.email_status;

      console.log(`  → Found: ${name} - ${title}`);
      console.log(`     Email: ${email || '(none)'} [${emailStatus}]`);

      if (email && !email.match(/^(info|sales|ir|contact)@/)) {
        updates.push({
          rowIndex: target.index + 1, // +1 for header row
          company: target.company,
          contactName: name,
          title: title,
          email: email,
          linkedin: linkedin,
          emailStatus: emailStatus
        });

        log.push({
          company: target.company,
          contact: name,
          title: title,
          email: email,
          emailStatus: emailStatus,
          source: 'Apollo API'
        });
      } else if (name) {
        // Update name/title even without email
        console.log(`     (Will update name/title only)`);
        updates.push({
          rowIndex: target.index + 1,
          company: target.company,
          contactName: name,
          title: title,
          email: null,
          linkedin: linkedin,
          partial: true
        });
      }
    } else {
      console.log(`  ✗ No contacts found`);
    }

    // Rate limit
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  console.log(`\n\n=== UPDATING SHEET ===`);
  if (updates.length > 0) {
    await updateSheet(updates);
    console.log(`\n✓ Updated ${updates.length} leads in sheet`);
  } else {
    console.log('No updates to make');
  }

  // Save log
  const logFile = `enrichment-log-${new Date().toISOString().split('T')[0]}.json`;
  fs.writeFileSync(logFile, JSON.stringify(log, null, 2));
  console.log(`\n✓ Saved log to ${logFile}`);

  console.log('\n=== SUMMARY ===');
  console.log(`Firms searched: ${TARGET_FIRMS.length}`);
  console.log(`Leads enriched: ${updates.length}`);
  console.log(`Success rate: ${Math.round(updates.length / TARGET_FIRMS.length * 100)}%`);
}

main().catch(console.error);
