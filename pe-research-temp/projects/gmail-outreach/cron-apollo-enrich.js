const axios = require('axios');
const { google } = require('googleapis');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Leads to enrich with Apollo
const enrichments = [
  {
    row: 161,
    firm: 'Thomas H. Lee Partners',
    domain: 'thl.com',
    searchNames: ['Mark Bean', 'Ganesh Rao', 'Todd Abbrecht'],
    titles: ['Managing Director', 'Partner']
  },
  {
    row: 212,
    firm: 'Long Point Capital',
    domain: 'longpointcapital.com',
    searchNames: ['Ira Starr', 'Eric Von Stroh'],
    titles: ['Partner']
  }
];

async function apolloPersonSearch(name, domain, titles) {
  try {
    const response = await axios.post(
      'https://api.apollo.io/v1/people/match',
      {
        first_name: name.split(' ')[0],
        last_name: name.split(' ').slice(1).join(' '),
        organization_name: domain.replace('.com', '').replace('.', ' '),
        domain: domain
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );

    if (response.data && response.data.person) {
      const person = response.data.person;
      return {
        name: `${person.first_name} ${person.last_name}`,
        title: person.title || '',
        email: person.email || '',
        linkedin: person.linkedin_url || '',
        found: true
      };
    }
    return { found: false };
  } catch (error) {
    console.error(`Apollo error for ${name}:`, error.response?.data || error.message);
    return { found: false };
  }
}

async function updateSheet(updates) {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  for (const update of updates) {
    if (!update.found) continue;

    const range = `Sheet1!B${update.row}:F${update.row}`;
    const values = [[
      update.name,
      update.title,
      update.email,
      '', // Website column - leave empty
      update.linkedin
    ]];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: range,
      valueInputOption: 'RAW',
      resource: { values }
    });

    console.log(`✅ Updated row ${update.row}: ${update.name} | ${update.email}`);
  }
}

async function main() {
  console.log('Starting Apollo enrichment...\n');
  const updates = [];

  for (const enrichment of enrichments) {
    console.log(`\nEnriching: ${enrichment.firm} (Row ${enrichment.row})`);
    
    for (const name of enrichment.searchNames) {
      console.log(`  Searching for: ${name}...`);
      const result = await apolloPersonSearch(name, enrichment.domain, enrichment.titles);
      
      if (result.found) {
        console.log(`  ✅ Found: ${result.name} | ${result.title} | ${result.email}`);
        updates.push({
          row: enrichment.row,
          firm: enrichment.firm,
          ...result
        });
        break; // Found one contact for this firm, move to next
      } else {
        console.log(`  ❌ Not found: ${name}`);
      }
    }
  }

  console.log(`\n\nTotal enrichments found: ${updates.length}`);
  
  if (updates.length > 0) {
    console.log('\nUpdating Google Sheet...');
    await updateSheet(updates);
    console.log('\n✅ Sheet updated successfully!');
  }

  console.log('\n📊 SUMMARY:');
  updates.forEach(u => {
    console.log(`  ${u.firm}: ${u.name} (${u.title}) - ${u.email}`);
  });
}

main().catch(console.error);
