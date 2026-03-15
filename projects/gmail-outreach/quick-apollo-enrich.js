const https = require('https');
const fs = require('fs');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Read enrichment targets
const targets = JSON.parse(fs.readFileSync('enrichment-targets-current.json', 'utf8'));

// Focus on PE firms that are not dead/non-PE
const validPEFirms = [
  { company: 'Sunstone Partners', domain: 'sunstonepartners.com' },
  { company: 'Tola Capital', domain: 'tolacapital.com' },
  { company: 'Traction Capital', domain: 'tractioncapital.com' },
  { company: 'Tailwater Capital', domain: 'tailwater.com' }
];

async function searchApolloContacts(company, domain) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      "api_key": APOLLO_API_KEY,
      "q_organization_domains": domain,
      "page": 1,
      "per_page": 10,
      "person_titles": [
        "Partner",
        "Managing Partner",
        "Principal",
        "Vice President",
        "VP",
        "Director",
        "Managing Director",
        "Head of Business Development"
      ]
    });

    const options = {
      hostname: 'api.apollo.io',
      port: 443,
      path: '/v1/mixed_people/search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Content-Length': postData.length
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('Starting Apollo enrichment for PE firms...\n');
  const results = [];

  for (const firm of validPEFirms) {
    console.log(`\n=== Searching ${firm.company} ===`);
    try {
      const data = await searchApolloContacts(firm.company, firm.domain);
      
      if (data.people && data.people.length > 0) {
        console.log(`Found ${data.people.length} contacts`);
        
        for (const person of data.people.slice(0, 3)) {
          if (person.email && !person.email.match(/^(info@|sales@|contact@)/i)) {
            console.log(`  - ${person.name}`);
            console.log(`    Title: ${person.title}`);
            console.log(`    Email: ${person.email}`);
            console.log(`    LinkedIn: ${person.linkedin_url || 'N/A'}`);
            
            results.push({
              company: firm.company,
              name: person.name,
              title: person.title,
              email: person.email,
              linkedin: person.linkedin_url || '',
              source: 'Apollo API'
            });
          }
        }
      } else {
        console.log(`No contacts found`);
      }
    } catch (error) {
      console.error(`Error searching ${firm.company}:`, error.message);
    }
    
    // Rate limit: wait 2 seconds between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(`\n\n=== ENRICHMENT COMPLETE ===`);
  console.log(`Total contacts found: ${results.length}`);
  
  fs.writeFileSync('apollo-enrichment-results.json', JSON.stringify(results, null, 2));
  console.log('Results saved to apollo-enrichment-results.json');
}

main().catch(console.error);
