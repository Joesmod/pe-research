const axios = require('axios');
const fs = require('fs');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const APOLLO_API_URL = 'https://api.apollo.io/api/v1/mixed_people/search';

const newFirms = [
  {
    company: 'Rockwood Equity',
    domain: 'rockwoodequity.com',
    website: 'https://www.rockwoodequity.com',
    sector: 'Lower middle-market PE, B2B services, healthcare, aerospace & defense',
    notes: 'Offices in Cleveland, Denver, NYC. Portfolio includes 24+ companies.'
  },
  {
    company: 'Linden Capital Partners',
    domain: 'linden.com',
    website: 'https://www.linden.com',
    sector: 'Middle-market healthcare & life sciences',
    notes: 'Structured Capital Fund II at $400M (2024). Chicago-based.'
  },
  {
    company: 'Lightyear Capital',
    domain: 'lycap.com',
    website: 'https://www.lycap.com',
    sector: 'Financial services, fintech, healthcare, business services',
    notes: 'Founded 2000, NYC-based, sector-specialist PE firm ~$5B+ AUM.'
  },
  {
    company: 'One Equity Partners',
    domain: 'oneequity.com',
    website: 'https://www.oneequity.com',
    sector: 'Middle market industrial, healthcare, technology',
    notes: 'North America and Europe focus.'
  }
];

async function searchApolloContacts(company, domain) {
  console.log(`\n🔍 Searching Apollo for: ${company}`);
  
  try {
    const response = await axios.post(
      APOLLO_API_URL,
      {
        organization_domains: [domain],
        person_titles: [
          'CEO', 'CTO', 'COO', 'CMO', 'CFO',
          'Managing Partner', 'Managing Director',
          'Partner', 'General Partner', 'Operating Partner',
          'Director', 'VP Technology', 'VP Operations',
          'Head of Technology', 'Head of Operations',
          'Head of Value Creation', 'Chief Digital Officer'
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
    
    if (response.data && response.data.people) {
      console.log(`✅ Found ${response.data.people.length} contacts for ${company}`);
      return response.data.people.map(person => ({
        name: person.name,
        title: person.title,
        email: person.email,
        linkedin: person.linkedin_url,
        source: 'Apollo API'
      }));
    }
    
    return [];
  } catch (error) {
    console.error(`❌ Error searching ${company}:`, error.response?.data || error.message);
    return [];
  }
}

async function main() {
  console.log('🚀 Apollo Enrichment - New PE Firms\n');
  console.log('=' .repeat(80));
  
  const results = [];
  
  for (const firm of newFirms) {
    const contacts = await searchApolloContacts(firm.company, firm.domain);
    
    if (contacts.length > 0) {
      // Pick the best contact (highest seniority)
      const bestContact = contacts[0];
      
      results.push({
        ...firm,
        contactName: bestContact.name,
        title: bestContact.title,
        email: bestContact.email,
        linkedin: bestContact.linkedin,
        status: 'Enriched',
        enrichmentNotes: `Apollo-verified ${bestContact.title}. ${contacts.length} total contacts found. Source: Apollo API (2026-03-14 cron)`
      });
      
      console.log(`  → Best: ${bestContact.name} (${bestContact.title})`);
      console.log(`  → Email: ${bestContact.email || '(not found)'}`);
    } else {
      results.push({
        ...firm,
        contactName: '',
        title: '',
        email: '',
        linkedin: '',
        status: 'Needs Manual Research',
        enrichmentNotes: 'Apollo search returned no results. Needs manual research.'
      });
      console.log(`  → No contacts found`);
    }
    
    // Rate limit: 1 request per second
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('\n📊 Summary:\n');
  
  results.forEach((r, idx) => {
    console.log(`${idx + 1}. ${r.company}`);
    console.log(`   Contact: ${r.contactName || '(EMPTY)'} | ${r.title || '(EMPTY)'}`);
    console.log(`   Email: ${r.email || '(EMPTY)'}`);
    console.log(`   Status: ${r.status}`);
    console.log('');
  });
  
  // Save to file
  fs.writeFileSync(
    'apollo-enriched-firms-march14-807am.json',
    JSON.stringify(results, null, 2)
  );
  
  console.log('💾 Saved results to apollo-enriched-firms-march14-807am.json');
  console.log('\nNext: Add these to Google Sheet');
}

main().catch(console.error);
