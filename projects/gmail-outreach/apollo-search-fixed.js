const https = require('https');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

const firms = [
  { name: 'Littlejohn', domain: 'littlejohnllc.com' },
  { name: 'Charlesbank Capital Partners', domain: 'charlesbank.com' },
  { name: 'PSG', domain: 'psgequity.com' },
  { name: 'TowerBrook Capital Partners', domain: 'towerbrook.com' },
  { name: 'Pritzker Private Capital', domain: 'ppcpartners.com' },
  { name: 'Symphony Technology Group', domain: 'stg.com' },
  { name: 'Trian Fund Management', domain: 'trianpartners.com' },
  { name: 'Prospect Capital Management', domain: 'prospectcap.com' },
  { name: 'CORE Industrial Partners', domain: 'coreipfund.com' },
  { name: 'Five Elms Capital', domain: 'fiveelms.com' },
];

async function searchPeopleByDomain(domain, titles) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      q_organization_domains: [domain],
      person_titles: titles,
      page: 1,
      per_page: 10
    });

    const options = {
      hostname: 'api.apollo.io',
      path: '/v1/mixed_people/search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'X-Api-Key': APOLLO_API_KEY
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(responseData));
          } catch (e) {
            reject(new Error(`Parse error: ${e.message}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function enrichFirms() {
  console.log('Apollo.io PE Contact Enrichment (Fixed API)');
  console.log('=' .repeat(70));
  console.log('Searching for C-level, Partners, and Directors at PE firms...\n');

  const titles = [
    'CEO', 'Managing Partner', 'Managing Director', 
    'Partner', 'Co-Founder', 'President', 
    'Chief Operating Officer', 'COO', 'CTO', 'CFO',
    'Director', 'VP', 'Vice President'
  ];

  const enrichedContacts = [];

  for (const firm of firms) {
    try {
      console.log(`\nSearching: ${firm.name} (${firm.domain})...`);
      const result = await searchPeopleByDomain(firm.domain, titles);
      
      if (result.people && result.people.length > 0) {
        console.log(`  ✓ Found ${result.people.length} contacts:`);
        result.people.forEach((person, idx) => {
          console.log(`\n    ${idx + 1}. ${person.name}`);
          console.log(`       Title: ${person.title || 'N/A'}`);
          console.log(`       Email: ${person.email || 'NOT AVAILABLE'}`);
          console.log(`       Email Status: ${person.email_status || 'N/A'}`);
          console.log(`       LinkedIn: ${person.linkedin_url || 'N/A'}`);
          
          enrichedContacts.push({
            firm: firm.name,
            name: person.name,
            title: person.title,
            email: person.email,
            emailStatus: person.email_status,
            linkedin: person.linkedin_url
          });
        });
      } else {
        console.log(`  ✗ No contacts found`);
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
      console.log(`  ✗ ERROR: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log(`TOTAL ENRICHED CONTACTS: ${enrichedContacts.length}`);
  console.log('=' .repeat(70));

  // Save results to JSON
  const fs = require('fs');
  fs.writeFileSync('apollo-results.json', JSON.stringify(enrichedContacts, null, 2));
  console.log('\nResults saved to: apollo-results.json');
}

enrichFirms().catch(console.error);
