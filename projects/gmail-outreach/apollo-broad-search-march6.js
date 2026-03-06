const axios = require('axios');
const fs = require('fs');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Target firms for enrichment
const FIRMS = [
  'Regal Healthcare Capital Partners',
  'Alvarez & Marsal Capital',
  'Casa Verde Capital',
  'Pine Brook Partners',
  'Marlin Equity Partners',
  'AEA Investors',
  'Rockbridge Growth Equity',
  'Balmoral Funds',
  'Trive Capital',
  'Abry Partners',
  'North Point',
  'Endeavor Capital',
  'Blue Point Capital Partners'
];

async function searchFirm(firmName) {
  try {
    console.log(`\nSearching ${firmName}...`);
    
    const response = await axios.post('https://api.apollo.io/api/v1/mixed_people/api_search', {
      q_organization_name: firmName,
      person_titles: [
        'Partner',
        'Managing Partner',
        'General Partner',
        'Operating Partner',
        'CEO',
        'CFO',
        'COO',
        'CTO',
        'Managing Director',
        'Director',
        'Vice President',
        'Head of',
        'Chief'
      ],
      per_page: 5
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': APOLLO_API_KEY
      }
    });
    
    if (response.data && response.data.people && response.data.people.length > 0) {
      const results = response.data.people
        .filter(p => p.email && p.email.length > 0)
        .map(person => ({
          firm: firmName,
          name: `${person.first_name} ${person.last_name}`,
          title: person.title,
          email: person.email,
          linkedin: person.linkedin_url
        }));
      
      if (results.length > 0) {
        console.log(`✅ Found ${results.length} contacts:`);
        results.forEach(r => {
          console.log(`   ${r.name} - ${r.title}`);
          console.log(`   📧 ${r.email}`);
        });
        return results;
      } else {
        console.log(`❌ No contacts with verified emails`);
        return [];
      }
    }
    
    console.log(`❌ No results from Apollo`);
    return [];
  } catch (error) {
    console.error(`Error searching ${firmName}:`, error.response?.data || error.message);
    return [];
  }
}

async function main() {
  const allFindings = [];
  
  console.log(`\n=== APOLLO BROAD SEARCH - March 6, 2026 - 12:36 AM ===`);
  console.log(`Searching ${FIRMS.length} firms for ANY decision-makers with verified emails...\n`);
  
  for (const firm of FIRMS) {
    const contacts = await searchFirm(firm);
    if (contacts.length > 0) {
      allFindings.push(...contacts);
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  console.log(`\n\n=== SUMMARY ===`);
  console.log(`Total contacts found: ${allFindings.length}`);
  console.log(`Firms with contacts: ${new Set(allFindings.map(f => f.firm)).size} / ${FIRMS.length}\n`);
  
  // Save results
  fs.writeFileSync(
    'apollo-broad-findings-march6.json',
    JSON.stringify(allFindings, null, 2)
  );
  
  console.log(`📊 Results saved to apollo-broad-findings-march6.json\n`);
}

main().catch(console.error);
