const { google } = require('googleapis');
const axios = require('axios');
const fs = require('fs');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Priority targets - firms with structure issues or generic emails
const PRIORITY_FIRMS = [
  { row: 223, company: 'Harvest Partners (SCF)', note: 'Has name in title field' },
  { row: 276, company: 'Harkness Capital Partners', note: 'Has name in title field' },
  { row: 285, company: 'Sentinel Capital Partners', note: 'Has name in title field' },
  { row: 305, company: 'Bertram Capital', note: 'Has name in title field' },
  { row: 310, company: 'Argonaut Private Equity', note: 'Has name in title field' },
  { row: 311, company: 'Mill Point Capital', note: 'Has name in title field' },
  { row: 319, company: 'CIVC Partners', note: 'Has name in title field' },
  { row: 335, company: 'Odyssey Investment Partners', note: 'Has name in title field' },
  { row: 478, company: 'Palm Beach Capital', note: 'Has name in title field' },
  { row: 500, company: 'Aurora Capital Partners', note: 'Has name in title field' },
  { row: 511, company: 'Emerging Capital Partners - ECP', note: 'Has name in title field' },
  { row: 525, company: 'Levine Leichtman Capital Partners, LLC', note: 'Has name in title field' },
  { row: 531, company: 'Peninsula Capital Partners L.L.C.', note: 'Has name in title field' },
  { row: 535, company: 'RA Capital Management', note: 'Has name in title field' },
  { row: 851, company: 'Wynnchurch Capital', note: 'Has name in title field' }
];

async function searchApollo(companyName) {
  try {
    const response = await axios.post(
      'https://api.apollo.io/v1/mixed_people/api_search',
      {
        q_organization_name: companyName,
        person_titles: [
          'Managing Partner',
          'Managing Director', 
          'Partner',
          'CEO',
          'COO',
          'CTO',
          'Head of Portfolio Operations',
          'Head of Value Creation',
          'VP Operations',
          'VP Technology',
          'Director of Technology',
          'Director of Operations',
          'Director of Digital'
        ],
        per_page: 10,
        page: 1
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );

    return response.data.people || [];
  } catch (error) {
    console.error(`Apollo search error for ${companyName}:`, error.response?.data || error.message);
    return [];
  }
}

async function enrichPerson(personId) {
  try {
    const response = await axios.post(
      'https://api.apollo.io/v1/people/match',
      {
        id: personId,
        reveal_personal_emails: true
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );

    const person = response.data.person;
    if (person && person.email) {
      return {
        name: `${person.first_name} ${person.last_name}`,
        title: person.title,
        email: person.email,
        linkedin: person.linkedin_url
      };
    }
    return null;
  } catch (error) {
    console.error(`Enrich error:`, error.response?.data || error.message);
    return null;
  }
}

async function findBestContact(companyName) {
  console.log(`\n🔍 Searching ${companyName}...`);
  
  const people = await searchApollo(companyName);
  
  if (people.length === 0) {
    console.log(`  ❌ No contacts found`);
    return null;
  }
  
  console.log(`  Found ${people.length} candidates`);
  
  // Try to enrich top 3 candidates with verified emails
  for (const person of people.slice(0, 3)) {
    if (person.id) {
      console.log(`  Trying: ${person.first_name} ${person.last_name || ''} - ${person.title}`);
      
      const enriched = await enrichPerson(person.id);
      
      if (enriched && enriched.email && !enriched.email.includes('@apollo.io')) {
        console.log(`  ✅ Found: ${enriched.name} (${enriched.email})`);
        return enriched;
      }
      
      await new Promise(r => setTimeout(r, 800)); // Rate limit
    }
  }
  
  console.log(`  ❌ No verified email found`);
  return null;
}

async function updateSheet(updates) {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  for (const update of updates) {
    if (!update.contact) continue;
    
    try {
      // Update Contact Name (column C)
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!C${update.row}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[update.contact.name]]
        }
      });
      
      // Update Title (column D)
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!D${update.row}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[update.contact.title]]
        }
      });
      
      // Update Email (column E)
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!E${update.row}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[update.contact.email]]
        }
      });
      
      // Update LinkedIn (column G)
      if (update.contact.linkedin) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `Sheet1!G${update.row}`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [[update.contact.linkedin]]
          }
        });
      }
      
      // Update Status (column J)
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!J${update.row}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [['Enriched']]
        }
      });
      
      // Update Notes (column L)
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!L${update.row}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[`Apollo enriched ${new Date().toISOString().split('T')[0]}: ${update.source || 'Apollo API'}`]]
        }
      });
      
      console.log(`✓ Updated row ${update.row}: ${update.company}`);
      
      await new Promise(r => setTimeout(r, 500));
    } catch (error) {
      console.error(`Error updating row ${update.row}:`, error.message);
    }
  }
}

async function main() {
  console.log('=== PE ENRICHMENT CRON - March 12, 2026 4:37 AM ===\n');
  
  const enriched = [];
  const failed = [];
  
  for (const target of PRIORITY_FIRMS.slice(0, 15)) {
    const contact = await findBestContact(target.company);
    
    if (contact) {
      enriched.push({
        row: target.row,
        company: target.company,
        contact: contact,
        source: 'Apollo API'
      });
    } else {
      failed.push(target);
    }
    
    await new Promise(r => setTimeout(r, 2000)); // Rate limit between firms
  }
  
  console.log('\n\n=== ENRICHMENT SUMMARY ===');
  console.log(`✅ Enriched: ${enriched.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  
  if (enriched.length > 0) {
    console.log('\n📝 Updating Google Sheet...');
    await updateSheet(enriched);
  }
  
  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    enriched: enriched,
    failed: failed
  };
  
  fs.writeFileSync(
    'enrichment-report-march12-437am.json',
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n✓ Report saved to enrichment-report-march12-437am.json');
  console.log('\n=== COMPLETION DETAILS ===');
  
  enriched.forEach(e => {
    console.log(`\nRow ${e.row}: ${e.company}`);
    console.log(`  → ${e.contact.name} (${e.contact.title})`);
    console.log(`  → ${e.contact.email}`);
    if (e.contact.linkedin) console.log(`  → ${e.contact.linkedin}`);
  });
  
  if (failed.length > 0) {
    console.log('\n\n❌ NEEDS MANUAL RESEARCH:');
    failed.forEach(f => {
      console.log(`  - Row ${f.row}: ${f.company}`);
    });
  }
}

main().catch(console.error);
