const { google } = require('googleapis');
const axios = require('axios');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

let auth, sheets;

async function initialize() {
  auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  sheets = google.sheets({ version: 'v4', auth });
}

async function searchApollo(firmName, domain, titleSearch) {
  try {
    console.log(`    🔎 Searching for ${titleSearch} at ${firmName}...`);
    
    const searchPayload = {
      q_organization_domains: domain,
      person_titles: Array.isArray(titleSearch) ? titleSearch : [titleSearch],
      per_page: 3
    };
    
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
      
      // Enrich to get full email
      try {
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
            linkedin: enrichedPerson.linkedin_url || ''
          };
        }
      } catch (err) {
        console.log(`      ⚠️  Enrich error: ${err.message}`);
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    return null;
  } catch (error) {
    console.error(`    ❌ Search error: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

async function appendToSheet(firm) {
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:N',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          firm.company,
          firm.notebookLM || '',
          firm.contact || '',
          firm.title || '',
          firm.email || '',
          firm.website || '',
          firm.linkedin || '',
          firm.enriched || 'Enriched',
          firm.notes || 'Added via research cron',
          firm.status || 'New',
          '',  // Last Contacted
          '',  // Notes
          '',  // Company Info URL
          ''   // Gumbo Score
        ]]
      }
    });
    console.log(`    ✅ Added to sheet: ${firm.company} - ${firm.contact}`);
    return true;
  } catch (error) {
    console.error(`    ❌ Failed to append: ${error.message}`);
    return false;
  }
}

async function run() {
  try {
    console.log('🎯 Adding 3-5 New Mid-Market PE Firms');
    console.log('Time:', new Date().toISOString());
    console.log('');
    
    await initialize();
    
    // Define new firms to add
    const newFirms = [
      {
        company: 'Bow River Capital',
        website: 'bowrivercapital.com',
        domain: 'bowrivercapital.com',
        targetTitles: ['CEO', 'Chief Executive Officer', 'President', 'COO', 'Head of Private Equity'],
        notes: 'Denver-based, ~$2.5B+ AUM, focus on software, healthcare services, industrial services'
      },
      {
        company: 'Sverica Capital Management',
        website: 'sverica.com',
        domain: 'sverica.com',
        targetTitles: ['Managing Partner', 'CEO', 'Partner', 'Managing Director'],
        notes: 'Boston-based, mid-market PE, focus on business & financial services, healthcare'
      },
      {
        company: 'Resilience Capital Partners',
        website: 'resiliencecapital.com',
        domain: 'resiliencecapital.com',
        targetTitles: ['Managing Partner', 'CEO', 'Partner', 'COO'],
        notes: 'Denver-based, mid-market PE, focus on healthcare, business services, industrials'
      },
      {
        company: 'Marlin Equity Partners',
        website: 'marlinequity.com',
        domain: 'marlinequity.com',
        targetTitles: ['Managing Partner', 'CEO', 'Head of Technology', 'Partner'],
        notes: 'Los Angeles-based, $8B+ AUM, focus on technology, business services, healthcare'
      }
    ];
    
    let added = 0;
    let failed = 0;
    
    for (const firm of newFirms) {
      console.log(`\n[${added + failed + 1}/${newFirms.length}] ${firm.company}`);
      console.log(`  Website: ${firm.website}`);
      
      const result = await searchApollo(firm.company, firm.domain, firm.targetTitles);
      
      if (result) {
        console.log(`    ✨ Found: ${result.name} - ${result.title}`);
        console.log(`    📧 Email: ${result.email}`);
        
        const appended = await appendToSheet({
          company: firm.company,
          contact: result.name,
          title: result.title,
          email: result.email,
          website: `https://${firm.website}`,
          linkedin: result.linkedin,
          notes: `${firm.notes}. Apollo API.`,
          status: 'New'
        });
        
        if (appended) added++;
        else failed++;
      } else {
        console.log(`    ⚠️  No contact found - adding firm with placeholder`);
        
        const appended = await appendToSheet({
          company: firm.company,
          contact: '',
          title: '',
          email: '',
          website: `https://${firm.website}`,
          linkedin: '',
          notes: `${firm.notes}. Needs enrichment.`,
          status: 'Needs Research'
        });
        
        if (appended) added++;
        else failed++;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 NEW FIRMS SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully added: ${added}`);
    console.log(`⚠️  Failed: ${failed}`);
    console.log(`📝 Total attempted: ${newFirms.length}`);
    
    return { added, failed, total: newFirms.length };
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error(error.stack);
    throw error;
  }
}

run().then(results => {
  console.log('\n🎉 New firms addition complete!');
  process.exit(0);
}).catch(err => {
  console.error('\n💥 Failed:', err.message);
  process.exit(1);
});
