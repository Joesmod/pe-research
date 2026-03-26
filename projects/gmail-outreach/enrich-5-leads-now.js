const { google } = require('googleapis');
const axios = require('axios');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

const targets = [
  { rowNum: 1067, company: 'Trivest Partners', website: '', currentEmail: 'info@trivest.com' },
  { rowNum: 1226, company: 'Gryphon Investors', website: '', currentEmail: '' },
  { rowNum: 1234, company: 'Gryphon Investors', website: 'San Francisco, CA', currentEmail: '' },
  { rowNum: 1251, company: 'Altaris Capital Partners', website: 'https://altariscap.com', currentEmail: '' },
  { rowNum: 1255, company: 'ShoreView', website: 'https://www.shoreview.com/', currentEmail: 'info@shoreview.com' }
];

let auth, sheets;

async function initialize() {
  auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  sheets = google.sheets({ version: 'v4', auth });
}

async function searchApollo(firmName, website) {
  try {
    console.log(`  🔎 Searching Apollo for ${firmName}...`);
    
    // Extract domain from website
    let domain = '';
    if (website && website.startsWith('http')) {
      domain = website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    }
    
    // Try multiple title variations
    const titleSets = [
      ['CEO', 'CTO', 'COO', 'Managing Partner', 'General Partner'],
      ['Partner', 'Operating Partner', 'Managing Director'],
      ['VP Operations', 'VP Technology', 'VP Digital', 'Director of Technology'],
      ['Head of Technology', 'Head of Value Creation', 'Head of Portfolio Operations']
    ];
    
    for (const titles of titleSets) {
      const searchPayload = {
        person_titles: titles,
        per_page: 5
      };
      
      if (domain) {
        searchPayload.q_organization_domains = domain;
      } else {
        searchPayload.q_organization_name = firmName;
      }
      
      console.log(`  Trying titles: ${titles.slice(0, 2).join(', ')}...`);
      
      const searchResponse = await axios.post(
        'https://api.apollo.io/api/v1/mixed_people/search',
        searchPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': APOLLO_API_KEY
          }
        }
      );
      
      if (searchResponse.data.people && searchResponse.data.people.length > 0) {
        const person = searchResponse.data.people[0];
        
        // Now enrich to get full email
        const enrichResponse = await axios.post(
          'https://api.apollo.io/v1/people/match',
          { id: person.id },
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Api-Key': APOLLO_API_KEY
            }
          }
        );
        
        const enrichedPerson = enrichResponse.data.person;
        
        if (enrichedPerson && enrichedPerson.email) {
          return {
            name: enrichedPerson.name,
            title: enrichedPerson.title,
            email: enrichedPerson.email,
            linkedin: enrichedPerson.linkedin_url || '',
            source: `Apollo API - ${titles[0]}`
          };
        }
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return null;
  } catch (error) {
    console.error(`  ❌ Apollo error:`, error.response?.data?.message || error.message);
    return null;
  }
}

async function updateSheet(rowNum, contact, title, email, linkedin, notes) {
  try {
    const updates = [];
    
    // Column indices (0-based): C=2, D=3, E=4, G=6, H=7
    if (contact) updates.push({ range: `Sheet1!C${rowNum}`, values: [[contact]] });
    if (title) updates.push({ range: `Sheet1!D${rowNum}`, values: [[title]] });
    if (email) updates.push({ range: `Sheet1!E${rowNum}`, values: [[email]] });
    if (linkedin) updates.push({ range: `Sheet1!G${rowNum}`, values: [[linkedin]] });
    
    // Update status to "Enriched"
    updates.push({ range: `Sheet1!H${rowNum}`, values: [['Enriched']] });
    
    // Add notes
    if (notes) {
      updates.push({ range: `Sheet1!I${rowNum}`, values: [[notes]] });
    }
    
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        data: updates,
        valueInputOption: 'USER_ENTERED'
      }
    });
    
    console.log(`  ✅ Updated row ${rowNum}`);
    return true;
  } catch (error) {
    console.error(`  ❌ Failed to update row ${rowNum}:`, error.message);
    return false;
  }
}

async function run() {
  console.log('🚀 Starting PE Enrichment - 5 Leads');
  console.log('Time:', new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }));
  console.log('');
  
  await initialize();
  
  let enriched = 0;
  let failed = 0;
  
  for (const target of targets) {
    console.log(`\n[${enriched + failed + 1}/${targets.length}] ${target.company} (Row ${target.rowNum})`);
    console.log(`  Current email: ${target.currentEmail || '(none)'}`);
    
    const result = await searchApollo(target.company, target.website);
    
    if (result) {
      console.log(`  ✨ Found: ${result.name} - ${result.title}`);
      console.log(`  📧 Email: ${result.email}`);
      
      const notes = `${result.source}. Enriched ${new Date().toISOString().split('T')[0]}.`;
      
      const updated = await updateSheet(
        target.rowNum,
        result.name,
        result.title,
        result.email,
        result.linkedin,
        notes
      );
      
      if (updated) {
        enriched++;
      } else {
        failed++;
      }
    } else {
      console.log(`  ⚠️  No contact found via Apollo`);
      failed++;
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 ENRICHMENT SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successfully enriched: ${enriched}`);
  console.log(`⚠️  Failed/not found: ${failed}`);
  console.log(`📝 Total processed: ${targets.length}`);
  
  return { enriched, failed, total: targets.length };
}

run().then(results => {
  console.log('\n🎉 Enrichment complete!');
  process.exit(0);
}).catch(err => {
  console.error('\n💥 Enrichment failed:', err.message);
  process.exit(1);
});
