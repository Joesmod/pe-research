const https = require('https');
const fs = require('fs');

const API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Firms to enrich
const firms = [
  {
    name: 'Warren Equity Partners',
    domain: 'warrenequity.com',
    targets: ['Steven Wacaster', 'Scott Bruckmann', 'Henrik Dahlback', 'Carl Johnson']
  },
  {
    name: 'Arsenal Capital Partners', 
    domain: 'arsenalcapital.com',
    targets: ['Terry Mullen', 'Joelle Marquis', 'Steve McLean', 'Tim Zappala']
  }
];

async function searchPeople(firmDomain, personName) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      api_key: API_KEY,
      q_organization_domains: firmDomain,
      person_names: [personName],
      page: 1,
      per_page: 10
    });

    const options = {
      hostname: 'api.apollo.io',
      port: 443,
      path: '/v1/mixed_people/search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'Cache-Control': 'no-cache'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve(parsed);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  const results = [];
  
  console.log('Starting Apollo enrichment...\n');
  
  for (const firm of firms) {
    console.log(`\n📊 Enriching ${firm.name} (${firm.domain})...`);
    
    for (const person of firm.targets) {
      try {
        console.log(`  Searching for: ${person}...`);
        const response = await searchPeople(firm.domain, person);
        
        if (response.people && response.people.length > 0) {
          const contact = response.people[0];
          results.push({
            company: firm.name,
            name: contact.name,
            title: contact.title,
            email: contact.email || null,
            phone: contact.phone_numbers?.[0]?.raw_number || null,
            linkedin: contact.linkedin_url || null,
            source: 'Apollo.io'
          });
          
          console.log(`    ✅ Found: ${contact.name} - ${contact.title}`);
          if (contact.email) console.log(`       Email: ${contact.email}`);
        } else {
          results.push({
            company: firm.name,
            name: person,
            title: null,
            email: null,
            source: 'Apollo.io - not found'
          });
          console.log(`    ❌ Not found`);
        }
        
        // Rate limit: wait 500ms between requests
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`    ⚠️ Error: ${error.message}`);
        results.push({
          company: firm.name,
          name: person,
          error: error.message,
          source: 'Apollo.io - error'
        });
      }
    }
  }
  
  console.log('\n\n📝 Writing results to apollo-enrichment-march7-836am.json...');
  fs.writeFileSync('apollo-enrichment-march7-836am.json', JSON.stringify(results, null, 2));
  
  console.log('\n✅ Enrichment complete!');
  console.log(`Total contacts searched: ${firms.reduce((sum, f) => sum + f.targets.length, 0)}`);
  console.log(`Emails found: ${results.filter(r => r.email).length}`);
}

main().catch(console.error);
