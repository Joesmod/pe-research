const axios = require('axios');
const fs = require('fs');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Target companies that appear to be real PE firms
const targets = [
  {row: 739, company: "EIV Capital, LLC", domain: "eivcapital.com"},
  {row: 740, company: "Emergence Capital", domain: "emcap.com"},
  {row: 742, company: "Excelsior Equity Partners", domain: "excelsiorequity.com"},
  {row: 747, company: "Gridiron Capital LLC", domain: "gridironcapital.com"},
];

async function searchPEContact(company, domain) {
  try {
    console.log(`\n🔍 Searching ${company}...`);
    
    const response = await axios.post(
      'https://api.apollo.io/v1/mixed_people/search',
      {
        organization_domains: [domain],
        person_titles: [
          "Managing Partner",
          "Managing Director",
          "Partner",
          "Chief Operating Officer",
          "COO",
          "Chief Technology Officer",
          "CTO",
          "VP Operations",
          "VP Technology",
          "VP Digital",
          "Head of Operations"
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
      const people = response.data.people;
      console.log(`✅ Found ${people.length} contacts`);
      
      // Return the top contact with verified email
      for (const person of people) {
        if (person.email && !person.email.match(/^(info|contact|sales|ir)@/i)) {
          console.log(`   → ${person.name}, ${person.title}`);
          console.log(`      ${person.email}`);
          console.log(`      ${person.linkedin_url || 'No LinkedIn'}`);
          
          return {
            name: person.name,
            title: person.title,
            email: person.email,
            linkedin: person.linkedin_url || '',
            source: 'Apollo API'
          };
        }
      }
    }
    
    console.log(`⚠️  No verified contacts found`);
    return null;
  } catch (error) {
    console.error(`❌ Error searching ${company}:`, error.response?.data?.message || error.message);
    return null;
  }
}

(async () => {
  const results = [];
  
  for (const target of targets) {
    const contact = await searchPEContact(target.company, target.domain);
    
    results.push({
      row: target.row,
      company: target.company,
      contact: contact || { name: '', title: '', email: '', linkedin: '', source: 'Not found' }
    });
    
    // Rate limit: wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n\n📊 ENRICHMENT SUMMARY`);
  console.log('='.repeat(60));
  
  const enriched = results.filter(r => r.contact.email);
  console.log(`✅ Successfully enriched: ${enriched.length}/${results.length}`);
  
  console.log(`\n📝 Results:`);
  results.forEach(r => {
    console.log(`\n${r.company} (Row ${r.row})`);
    if (r.contact.email) {
      console.log(`  ✓ ${r.contact.name} - ${r.contact.title}`);
      console.log(`    ${r.contact.email}`);
    } else {
      console.log(`  ✗ No verified contact found`);
    }
  });
  
  // Save results
  fs.writeFileSync('apollo-enrichment-706pm.json', JSON.stringify(results, null, 2));
  console.log(`\n💾 Saved to apollo-enrichment-706pm.json`);
})();
