const fetch = require('node-fetch');
const fs = require('fs');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const APOLLO_API_URL = 'https://api.apollo.io/v1';

// Targets from enrich-targets-march7-536am.json (firms needing enrichment)
const targets = [
  { company: 'Trinity Capital', row: 805 },
  { company: 'TriplePoint Capital', row: 807 },
  { company: 'Wildcat Capital Management', row: 811 },
  { company: 'Yellowstone Capital Partners', row: 813 },
  { company: '26North', row: 815 },
  { company: '414 Capital', row: 816 },
  { company: '777 Partners', row: 817 },
  { company: 'A-Grade Investments', row: 818 },
  { company: 'Accelerize 360', row: 819 },
];

async function searchPeopleAtFirm(companyName) {
  const url = `${APOLLO_API_URL}/mixed_people/search`;
  
  const body = {
    api_key: APOLLO_API_KEY,
    q_organization_name: companyName,
    person_titles: [
      'CEO', 'CTO', 'COO', 'Managing Partner', 'Managing Director',
      'Partner', 'Founder', 'Co-Founder', 'General Partner',
      'VP Technology', 'VP Operations', 'VP Portfolio', 
      'Director Technology', 'Director Operations', 'Head of Technology'
    ],
    page: 1,
    per_page: 5
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error searching ${companyName}:`, error.message);
    return null;
  }
}

async function enrichTargets() {
  console.log('🔬 Apollo.io PE Enrichment - March 7, 6:36 AM\n');
  console.log('='.repeat(60));

  const results = [];

  for (const target of targets) {
    console.log(`\n🔍 Researching: ${target.company} (Row ${target.row})`);
    
    const data = await searchPeopleAtFirm(target.company);
    
    if (data && data.people && data.people.length > 0) {
      console.log(`✅ Found ${data.people.length} contacts\n`);
      
      data.people.forEach((person, idx) => {
        const result = {
          row: target.row,
          company: target.company,
          name: person.name,
          title: person.title,
          email: person.email,
          linkedin: person.linkedin_url,
          source: 'Apollo.io API',
          confidence: person.email_status || 'unknown',
          timestamp: new Date().toISOString()
        };

        console.log(`  ${idx + 1}. ${person.name} - ${person.title}`);
        console.log(`     Email: ${person.email || 'NOT FOUND'}`);
        console.log(`     LinkedIn: ${person.linkedin_url || 'N/A'}`);
        console.log(`     Status: ${person.email_status || 'unknown'}\n`);

        results.push(result);
      });
    } else {
      console.log(`❌ No contacts found\n`);
      results.push({
        row: target.row,
        company: target.company,
        status: 'NO_RESULTS',
        source: 'Apollo.io API',
        timestamp: new Date().toISOString()
      });
    }

    // Rate limit: wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Save results
  fs.writeFileSync(
    './apollo-enrichment-march7-636am.json',
    JSON.stringify(results, null, 2)
  );

  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Enrichment Complete:`);
  console.log(`   Total targets: ${targets.length}`);
  console.log(`   Contacts found: ${results.filter(r => r.email).length}`);
  console.log(`   No results: ${results.filter(r => r.status === 'NO_RESULTS').length}`);
  console.log(`\n💾 Results saved to: apollo-enrichment-march7-636am.json`);
}

enrichTargets().catch(console.error);
