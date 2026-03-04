const axios = require('axios');
const { google } = require('googleapis');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const enrichments = [
  {
    row: 235,
    firm: 'AEA Investors',
    domain: 'aeainvestors.com',
    searchNames: ['Brian Hoesterey', 'Justin de La Chapelle', 'Thomas Pryma'],
    titles: ['Partner', 'COO']
  },
  {
    row: 237,
    firm: 'FFL Partners',
    domain: 'fflpartners.com',
    searchNames: ['Chris Harris', 'Cas Schneller', 'Karen Winterhof'],
    titles: ['Managing Partner', 'Partner']
  },
  {
    row: 224,
    firm: 'Pine Brook Partners',
    domain: 'pinebrookpartners.com',
    searchNames: ['Howard Newman', 'David Grain'],
    titles: ['Managing Partner', 'Partner']
  },
  {
    row: 232,
    firm: 'Sheridan Capital Partners',
    domain: 'sheridancap.com',
    searchNames: ['Timothy Sheridan', 'Michael Fitzgerald'],
    titles: ['Partner', 'Managing Director']
  },
  {
    row: 221,
    firm: 'Wicks Capital Partners',
    domain: 'wickscapital.com',
    searchNames: ['Thomas Kearney', 'Michael Wicks'],
    titles: ['Principal', 'Partner']
  }
];

async function apolloPersonSearch(name, domain, firm) {
  try {
    const nameParts = name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');
    
    const response = await axios.post(
      'https://api.apollo.io/v1/people/match',
      {
        first_name: firstName,
        last_name: lastName,
        organization_name: firm,
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
    return { found: false, error: error.response?.data?.message || error.message };
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
      '',
      update.linkedin
    ]];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: range,
      valueInputOption: 'RAW',
      resource: { values }
    });

    const statusRange = `Sheet1!J${update.row}:K${update.row}`;
    const statusValues = [['Enriched', `Apollo API - ${new Date().toISOString().split('T')[0]}`]];
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: statusRange,
      valueInputOption: 'RAW',
      resource: { values: statusValues }
    });

    console.log(`✅ Updated row ${update.row}: ${update.name} | ${update.email}`);
  }
}

async function main() {
  console.log('Starting Apollo enrichment batch 3...\n');
  const updates = [];
  const errors = [];

  for (const enrichment of enrichments) {
    console.log(`\nEnriching: ${enrichment.firm} (Row ${enrichment.row})`);
    
    let found = false;
    for (const name of enrichment.searchNames) {
      if (found) break;
      
      console.log(`  Searching for: ${name}...`);
      const result = await apolloPersonSearch(name, enrichment.domain, enrichment.firm);
      
      if (result.found && result.email) {
        console.log(`  ✅ Found: ${result.name} | ${result.title} | ${result.email}`);
        updates.push({
          row: enrichment.row,
          firm: enrichment.firm,
          ...result
        });
        found = true;
      } else {
        console.log(`  ❌ Not found: ${name} ${result.error ? '(' + result.error + ')' : ''}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    if (!found) {
      errors.push({ firm: enrichment.firm, row: enrichment.row });
    }
  }

  console.log(`\n\n📊 RESULTS:`);
  console.log(`Total enrichments found: ${updates.length}`);
  console.log(`Failed to enrich: ${errors.length}`);
  
  if (updates.length > 0) {
    console.log('\nUpdating Google Sheet...');
    await updateSheet(updates);
    console.log('\n✅ Sheet updated successfully!');
  }

  console.log('\n✅ ENRICHED:');
  updates.forEach(u => {
    console.log(`  Row ${u.row}: ${u.firm} - ${u.name} (${u.title}) - ${u.email}`);
  });

  if (errors.length > 0) {
    console.log('\n❌ FAILED:');
    errors.forEach(e => {
      console.log(`  Row ${e.row}: ${e.firm}`);
    });
  }
}

main().catch(console.error);
