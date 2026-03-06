const axios = require('axios');
const { google } = require('googleapis');
const fs = require('fs');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Load service account credentials
const credentials = JSON.parse(fs.readFileSync('service-account.json', 'utf8'));

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

// Firms to enrich from enrichment-needs-1136pm.json
const TARGETS = [
  { row: 5, company: 'Regal Healthcare Capital Partners', contactName: 'Jon Santemma' },
  { row: 10, company: 'Alvarez & Marsal Capital', contactName: 'Jack McCarthy' },
  { row: 12, company: 'Casa Verde Capital', contactName: 'Karan Wadhera' },
  { row: 224, company: 'Pine Brook Partners', contactName: 'Howard Newman' },
  { row: 229, company: 'Marlin Equity Partners', contactName: 'Alex Beregovsky' },
  { row: 235, company: 'AEA Investors', contactName: 'Brian Hoesterey' },
  { row: 379, company: 'Rockbridge Growth Equity, LLC', contactName: 'Spencer Hughes' },
  { row: 490, company: 'The Global Impact Investing Network', contactName: 'Jessica Rose' },
  { row: 579, company: 'Cardea Group', contactName: 'Jacob Zodikoff' },
  { row: 593, company: 'Balmoral Funds', contactName: 'Stephen Hodges' },
  { row: 633, company: 'Trive Capital', contactName: 'Conor Moran' },
  { row: 689, company: 'Abry Partners', contactName: 'David Genece' },
  { row: 742, company: 'North Point', contactName: 'Jim Fordyce' },
  { row: 836, company: 'Endeavor Capital', contactName: 'Steve Frazier' },
  { row: 952, company: 'Blue Point Capital Partners', contactName: 'Mike Davis' }
];

async function searchApollo(firmName, contactName) {
  try {
    const nameParts = contactName.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');
    
    console.log(`Searching Apollo for ${contactName} at ${firmName}...`);
    
    const response = await axios.post('https://api.apollo.io/api/v1/mixed_people/api_search', {
      q_organization_name: firmName,
      first_name: firstName,
      last_name: lastName,
      per_page: 3
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': APOLLO_API_KEY
      }
    });
    
    if (response.data && response.data.people && response.data.people.length > 0) {
      const person = response.data.people[0];
      return {
        email: person.email,
        title: person.title,
        linkedin: person.linkedin_url
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error searching ${contactName} at ${firmName}:`, error.response?.data || error.message);
    return null;
  }
}

async function updateSheet(updates) {
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  
  for (const update of updates) {
    const range = `Sheet1!D${update.row}:F${update.row}`;
    const values = [[update.email, update.linkedin, 'Enriched']];
    
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range,
        valueInputOption: 'RAW',
        resource: { values }
      });
      console.log(`✅ Updated row ${update.row}: ${update.company}`);
    } catch (error) {
      console.error(`❌ Failed to update row ${update.row}:`, error.message);
    }
  }
}

async function main() {
  const results = [];
  const findings = [];
  
  console.log(`\n=== PE ENRICHMENT CRON - March 6, 2026 - 12:36 AM ===\n`);
  console.log(`Processing ${TARGETS.length} firms...\n`);
  
  for (const target of TARGETS) {
    const apolloResult = await searchApollo(target.company, target.contactName);
    
    if (apolloResult && apolloResult.email) {
      const update = {
        row: target.row,
        company: target.company,
        contactName: target.contactName,
        email: apolloResult.email,
        title: apolloResult.title,
        linkedin: apolloResult.linkedin || '',
        status: 'Enriched'
      };
      
      results.push(update);
      findings.push({
        company: target.company,
        contact: target.contactName,
        title: apolloResult.title,
        email: apolloResult.email,
        source: 'Apollo API'
      });
      
      console.log(`✅ Found: ${target.contactName} - ${apolloResult.email}`);
      console.log(`   Title: ${apolloResult.title}\n`);
    } else {
      console.log(`❌ No verified email found for ${target.contactName} at ${target.company}\n`);
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n=== RESULTS ===`);
  console.log(`Enriched: ${results.length} / ${TARGETS.length}\n`);
  
  if (results.length > 0) {
    console.log('Updating Google Sheet...\n');
    await updateSheet(results);
  }
  
  // Save findings
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  fs.writeFileSync(
    `enrichment-findings-march6-midnight.json`,
    JSON.stringify(findings, null, 2)
  );
  
  console.log(`\n✅ Enrichment complete!`);
  console.log(`📊 Results saved to enrichment-findings-march6-midnight.json\n`);
}

main().catch(console.error);
