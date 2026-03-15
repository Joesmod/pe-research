const https = require('https');
const { google } = require('googleapis');
const fs = require('fs');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const credentials = JSON.parse(fs.readFileSync('service-account.json', 'utf8'));
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

// Search for a specific person at a company via Apollo
function searchPersonAtCompany(companyName, personName) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      q_organization_name: companyName,
      person_name: personName,
      page: 1,
      per_page: 3
    });
    
    const options = {
      hostname: 'api.apollo.io',
      path: '/v1/mixed_people/api_search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': APOLLO_API_KEY,
        'Content-Length': data.length
      }
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Update sheet row
async function updateRow(rowIndex, updates) {
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  
  const batchData = [];
  
  if (updates.contactName) batchData.push({ range: `Sheet1!C${rowIndex}`, values: [[updates.contactName]] });
  if (updates.title) batchData.push({ range: `Sheet1!D${rowIndex}`, values: [[updates.title]] });
  if (updates.email) batchData.push({ range: `Sheet1!E${rowIndex}`, values: [[updates.email]] });
  if (updates.linkedin) batchData.push({ range: `Sheet1!G${rowIndex}`, values: [[updates.linkedin]] });
  if (updates.notes) batchData.push({ range: `Sheet1!I${rowIndex}`, values: [[updates.notes]] });
  if (updates.status) batchData.push({ range: `Sheet1!H${rowIndex}`, values: [[updates.status]] });
  
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    resource: {
      data: batchData,
      valueInputOption: 'RAW'
    }
  });
}

// Priority targets to enrich
const targets = [
  { row: 14, firm: 'ShoreView Industries', contact: 'Paul Schaye' },
  { row: 72, firm: 'Flyover Capital', contact: null, searchTitle: 'Managing Partner' },
  { row: 15, firm: 'JLL Partners', contact: 'Johanna Doherty' },
  { row: 19, firm: 'Palladium Equity Partners', contact: 'Erick Bronner' },
  { row: 23, firm: 'HGGC', contact: 'John Fitzgerald' },
  { row: 27, firm: 'Roark Capital Group', contact: 'Alex Cooper' },
  { row: 28, firm: 'Seidler Equity Partners', contact: 'Tj Gupta' },
  { row: 33, firm: 'Nautic Partners', contact: 'Jim Beakey' },
  { row: 57, firm: 'Trivest Partners', contact: 'Forest Wester' },
  { row: 66, firm: 'Water Street Healthcare Partners', contact: 'Tim Dugan' },
  { row: 71, firm: 'Berkshire Partners', contact: 'Larry Hamelsky' },
  { row: 75, firm: 'Blue Point Capital Partners', contact: 'Chip Chaikin' },
  { row: 18, firm: 'Gryphon Investors', contact: 'R. David Andrews' },
  { row: 32, firm: 'Parthenon Capital Partners', contact: 'Jay Grossman' },
  { row: 56, firm: 'WindRose Health Investors', contact: 'Michael Benezra' }
];

async function enrichTargets() {
  console.log('Starting targeted enrichment of 15 leads...\n');
  
  let enriched = 0;
  
  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    console.log(`[${i+1}/15] Row ${target.row}: ${target.firm}`);
    
    try {
      let result;
      
      if (target.contact) {
        // Search for specific person
        result = await searchPersonAtCompany(target.firm, target.contact);
      } else if (target.searchTitle) {
        // Search by title
        const data = JSON.stringify({
          q_organization_name: target.firm,
          person_titles: [target.searchTitle, 'Co-Founder', 'Partner'],
          page: 1,
          per_page: 3
        });
        
        result = await new Promise((resolve, reject) => {
          const options = {
            hostname: 'api.apollo.io',
            path: '/v1/mixed_people/api_search',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Api-Key': APOLLO_API_KEY,
              'Content-Length': data.length
            }
          };
          
          const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => resolve(JSON.parse(body)));
          });
          req.on('error', reject);
          req.write(data);
          req.end();
        });
      }
      
      if (result && result.people && result.people.length > 0) {
        const person = result.people[0];
        
        if (person.email && (person.email_status === 'verified' || person.email_status === 'likely_to_engage')) {
          console.log(`  ✓ ${person.name} (${person.title})`);
          console.log(`    ${person.email} [${person.email_status}]`);
          
          await updateRow(target.row, {
            contactName: person.name,
            title: person.title,
            email: person.email,
            linkedin: person.linkedin_url || '',
            notes: `Apollo API: ${person.email_status}. Enriched ${new Date().toISOString().split('T')[0]}`,
            status: 'Enriched'
          });
          
          enriched++;
        } else {
          console.log(`  ⚠ Found ${person.name} but no verified email`);
        }
      } else {
        console.log(`  ✗ No match in Apollo`);
      }
      
      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 1200));
      
    } catch (error) {
      console.error(`  ✗ Error: ${error.message}`);
    }
  }
  
  console.log(`\n✅ Successfully enriched ${enriched}/15 leads`);
}

enrichTargets().catch(console.error);
