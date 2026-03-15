const axios = require('axios');
const { google } = require('googleapis');
const path = require('path');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

// Target firms that need enrichment
const targetFirms = [
  { name: 'Sverica Capital Management', domain: 'sverica.com', rows: [208, 894, 938, 1037, 1046, 1049] },
  { name: 'WindPoint Partners', domain: 'wppartners.com', rows: [220, 842] },
];

async function searchApolloContacts(companyName, domain) {
  console.log(`\n🔍 Searching Apollo for: ${companyName}...`);
  
  try {
    const response = await axios.post(
      'https://api.apollo.io/api/v1/mixed_people/api_search',
      {
        q_organization_name: companyName,
        q_organization_domains: [domain],
        person_titles: [
          'Managing Partner',
          'Managing Director',
          'Partner',
          'General Partner',
          'CEO',
          'President',
          'COO',
          'CTO',
          'VP',
          'Vice President',
          'Director'
        ],
        per_page: 10,
        page: 1
      },
      {
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );

    if (response.data && response.data.people) {
      console.log(`✅ Found ${response.data.people.length} contacts`);
      return response.data.people;
    }

    return [];
  } catch (error) {
    console.error(`❌ Apollo API error: ${error.message}`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data:`, error.response.data);
    }
    return [];
  }
}

async function main() {
  console.log('🔍 PE Research & Enrichment - Apollo API Run');
  console.log('Time: 2026-03-12 5:37 PM CST\n');

  const enrichmentResults = [];

  for (const firm of targetFirms) {
    const contacts = await searchApolloContacts(firm.name, firm.domain);
    
    if (contacts.length > 0) {
      console.log(`\n📋 Top contacts for ${firm.name}:`);
      
      contacts.slice(0, 5).forEach((person, idx) => {
        const email = person.email || 'No email';
        const title = person.title || 'No title';
        const name = `${person.first_name || ''} ${person.last_name || ''}`.trim();
        const linkedin = person.linkedin_url || '';
        
        console.log(`\n${idx + 1}. ${name}`);
        console.log(`   Title: ${title}`);
        console.log(`   Email: ${email}`);
        console.log(`   LinkedIn: ${linkedin}`);
        console.log(`   Verified: ${person.email_status || 'unknown'}`);
        
        enrichmentResults.push({
          firm: firm.name,
          rows: firm.rows,
          name,
          title,
          email,
          linkedin,
          verified: person.email_status
        });
      });
    } else {
      console.log(`⚠️ No contacts found for ${firm.name}`);
    }
    
    // Rate limit: wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n' + '='.repeat(80));
  console.log(`\n✅ Apollo enrichment complete. Found ${enrichmentResults.length} contacts.`);
  console.log('\nNext step: Review and update sheet with verified contacts.\n');

  // Save results
  const fs = require('fs');
  fs.writeFileSync(
    path.join(__dirname, 'apollo-enrichment-march12-537pm.json'),
    JSON.stringify(enrichmentResults, null, 2)
  );
  console.log('💾 Results saved to apollo-enrichment-march12-537pm.json');
}

main().catch(console.error);
