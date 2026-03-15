const axios = require('axios');
const fs = require('fs');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const APOLLO_BASE_URL = 'https://api.apollo.io/v1';

// Firms needing enrichment from the sheet
const firmsToEnrich = [
  { name: 'SFW Capital Partners', domain: 'sfwcap.com' },
  { name: 'Silicon Foundry', domain: 'sifoundry.com' },
  { name: 'Sun Capital Partners', domain: 'suncappart.com' },
  { name: 'Thoma Bravo', domain: 'thomabravo.com' },
  { name: 'Vista Equity Partners', domain: 'vistaequitypartners.com' },
  { name: 'TPG Capital', domain: 'tpg.com' },
  { name: 'Silver Lake Partners', domain: 'silverlake.com' },
  { name: 'Arsenal Capital Partners', domain: 'arsenalcapital.com' },
  { name: 'Centerbridge Partners', domain: 'centerbridge.com' },
  { name: 'Clearlake Capital', domain: 'clearlake.com' },
  { name: 'KSL Capital Partners', domain: 'kslcapital.com' },
  { name: 'Trivest Partners', domain: 'trivest.com' }
];

async function searchPeopleAtFirm(firmDomain, firmName) {
  try {
    console.log(`\n🔍 Searching contacts at ${firmName}...`);
    
    const response = await axios.post(
      `${APOLLO_BASE_URL}/mixed_people/search`,
      {
        person_titles: [
          'Managing Partner',
          'Managing Director',
          'Partner',
          'CEO',
          'President',
          'COO',
          'Head of Portfolio Operations',
          'Director of Technology',
          'VP of Technology'
        ],
        organization_domains: [firmDomain],
        page: 1,
        per_page: 5  // Get top 5 contacts per firm
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );

    if (response.data.people && response.data.people.length > 0) {
      console.log(`✅ Found ${response.data.people.length} contacts`);
      
      return response.data.people.map(person => ({
        firm: firmName,
        name: person.name,
        title: person.title,
        email: person.email,
        linkedin: person.linkedin_url,
        phone: person.phone_numbers?.[0]?.sanitized_number || '',
        source: 'Apollo.io API'
      }));
    } else {
      console.log(`⚠️ No contacts found for ${firmName}`);
      return [];
    }
  } catch (error) {
    console.error(`❌ Error searching ${firmName}:`, error.response?.data?.message || error.message);
    return [];
  }
}

async function enrichAllFirms() {
  const allContacts = [];
  
  for (const firm of firmsToEnrich) {
    const contacts = await searchPeopleAtFirm(firm.domain, firm.name);
    allContacts.push(...contacts);
    
    // Rate limiting: Apollo free tier has limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Save results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputPath = `apollo-enrichment-${timestamp}.json`;
  
  fs.writeFileSync(outputPath, JSON.stringify(allContacts, null, 2));
  console.log(`\n📊 Total contacts found: ${allContacts.length}`);
  console.log(`💾 Saved to: ${outputPath}`);
  
  // Print summary
  console.log('\n📋 Summary by firm:');
  const firmCounts = {};
  allContacts.forEach(c => {
    firmCounts[c.firm] = (firmCounts[c.firm] || 0) + 1;
  });
  Object.entries(firmCounts).forEach(([firm, count]) => {
    console.log(`  ${firm}: ${count} contacts`);
  });
  
  return allContacts;
}

enrichAllFirms().catch(console.error);
