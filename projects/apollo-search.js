const https = require('https');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Target firms to enrich
const targetFirms = [
  'Shore Capital Partners',
  'Menlo Ventures',
  'L Catterton',
  'TPG Capital',
  'Warburg Pincus'
];

async function searchApollo(companyName) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      "q_organization_name": companyName,
      "person_titles": [
        "Managing Partner",
        "Managing Director",
        "CEO",
        "Founder",
        "Partner",
        "General Partner"
      ],
      "per_page": 3
    });

    const options = {
      hostname: 'api.apollo.io',
      path: '/v1/mixed_people/search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': APOLLO_API_KEY
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`Apollo API error: ${res.statusCode} - ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function enrichFirms() {
  const results = [];
  
  for (const firm of targetFirms) {
    console.log(`\nSearching Apollo for: ${firm}...`);
    try {
      const data = await searchApollo(firm);
      
      if (data.people && data.people.length > 0) {
        const person = data.people[0]; // Take the top result
        results.push({
          firm,
          name: person.name,
          title: person.title,
          email: person.email,
          linkedin: person.linkedin_url,
          organization: person.organization_name
        });
        console.log(`Found: ${person.name} (${person.title}) - ${person.email || 'No email'}`);
      } else {
        console.log(`No results for ${firm}`);
      }
      
      // Rate limiting: wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error searching ${firm}:`, error.message);
    }
  }
  
  console.log('\n\n=== ENRICHMENT RESULTS ===');
  console.log(JSON.stringify(results, null, 2));
}

enrichFirms().catch(console.error);
