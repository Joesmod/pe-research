const axios = require('axios');
const fs = require('fs');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

const newFirms = [
  {
    name: 'Ridgemont Equity Partners',
    domain: 'ridgemontep.com',
    website: 'https://ridgemontep.com',
    focus: 'Business & industrial services, healthcare, technology-enabled services',
    aum: '~$6B'
  },
  {
    name: 'Gridiron Capital',
    domain: 'gridironcapital.com',
    website: 'https://gridironcapital.com',
    focus: 'Business services, healthcare services, tech-enabled services',
    aum: '~$2B'
  },
  {
    name: 'Norwest Equity Partners',
    domain: 'nep.com',
    website: 'https://nep.com',
    focus: 'Healthcare services, business services, technology-enabled services',
    aum: '~$7.5B'
  },
  {
    name: 'Goldner Hawn',
    domain: 'goldhawn.com',
    website: 'https://goldhawn.com',
    focus: 'Business services, healthcare, tech-enabled services',
    aum: '~$1.5B'
  },
  {
    name: 'Great Hill Partners',
    domain: 'greathillpartners.com',
    website: 'https://greathillpartners.com',
    focus: 'Software, digital commerce, healthcare IT, tech-enabled services',
    aum: '~$14B'
  }
];

async function searchApollo(firmName, domain) {
  try {
    console.log(`\n🔍 Searching Apollo for ${firmName}...`);
    
    const response = await axios.post(
      'https://api.apollo.io/api/v1/mixed_people/api_search',
      {
        organization_domains: [domain],
        person_titles: [
          'Partner',
          'Managing Partner',
          'CEO',
          'CTO',
          'Chief Technology Officer',
          'VP Technology',
          'VP Digital',
          'VP Portfolio Operations',
          'Chief Digital Officer',
          'Head of Technology',
          'Director of Technology'
        ],
        page: 1,
        per_page: 5
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );

    if (response.data && response.data.people && response.data.people.length > 0) {
      const contacts = response.data.people.map(person => ({
        name: person.name,
        title: person.title,
        email: person.email,
        linkedin: person.linkedin_url,
        verified: person.email_status === 'verified'
      }));
      
      console.log(`  ✅ Found ${contacts.length} contacts`);
      contacts.forEach(c => {
        console.log(`    - ${c.name} (${c.title})`);
        console.log(`      ${c.email || '[No email]'} ${c.verified ? '✓' : ''}`);
      });
      
      return contacts;
    } else {
      console.log(`  ❌ No contacts found`);
      return [];
    }
  } catch (error) {
    console.error(`  ❌ Error searching ${firmName}:`, error.response?.data || error.message);
    return [];
  }
}

async function main() {
  console.log('🎯 Enriching 5 new PE firms with Apollo.io\n');
  console.log('='.repeat(80));
  
  const enrichedFirms = [];
  
  for (const firm of newFirms) {
    const contacts = await searchApollo(firm.name, firm.domain);
    
    enrichedFirms.push({
      ...firm,
      contacts,
      bestContact: contacts.find(c => c.verified && c.email) || contacts[0] || null
    });
    
    // Rate limit: wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n\n📊 ENRICHMENT RESULTS\n');
  console.log('='.repeat(80));
  
  enrichedFirms.forEach(firm => {
    console.log(`\n${firm.name}`);
    console.log(`  Website: ${firm.website}`);
    console.log(`  AUM: ${firm.aum}`);
    console.log(`  Focus: ${firm.focus}`);
    
    if (firm.bestContact) {
      console.log(`  ✅ Best Contact: ${firm.bestContact.name}`);
      console.log(`     Title: ${firm.bestContact.title}`);
      console.log(`     Email: ${firm.bestContact.email || '[Not found]'}`);
      console.log(`     LinkedIn: ${firm.bestContact.linkedin || '[Not found]'}`);
    } else {
      console.log(`  ❌ No contacts found - manual research needed`);
    }
  });
  
  fs.writeFileSync(
    'new-firms-enriched-march14.json',
    JSON.stringify(enrichedFirms, null, 2)
  );
  
  console.log(`\n\n💾 Saved enriched data to new-firms-enriched-march14.json`);
}

main().catch(console.error);
