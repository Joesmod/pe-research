const https = require('https');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

const firms = [
  { name: 'Constitution Capital Partners', domain: 'concp.com', rowIndex: 586 },
  { name: 'D1 Capital Partners', domain: 'd1capital.com', rowIndex: 588 },
  { name: 'Dhanani Private Equity Group', domain: 'dhananipeg.com', rowIndex: 591 },
  { name: 'Drive Capital', domain: 'drivecapital.com', rowIndex: 594 }
];

async function searchApollo(domain, firmName) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      q_organization_domains: domain,
      page: 1,
      per_page: 10,
      person_titles: [
        'Managing Partner', 'Partner', 'Managing Director', 'CEO', 'Founder',
        'Chief Investment Officer', 'President', 'Principal'
      ]
    });

    const options = {
      hostname: 'api.apollo.io',
      port: 443,
      path: '/api/v1/mixed_people/api_search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': APOLLO_API_KEY,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

async function enrichFirms() {
  console.log('🔍 Searching Apollo for contacts at 4 PE firms...\n');

  for (const firm of firms) {
    console.log(`\n📍 Searching: ${firm.name} (${firm.domain})`);
    console.log(`   Row ${firm.rowIndex}`);
    
    try {
      const result = await searchApollo(firm.domain, firm.name);
      
      // Debug: print raw result structure
      console.log(`   Raw result keys: ${Object.keys(result).join(', ')}`);
      if (result.people && result.people[0]) {
        console.log(`   Sample person keys: ${Object.keys(result.people[0]).join(', ')}`);
      }
      
      if (result.people && result.people.length > 0) {
        console.log(`   ✅ Found ${result.people.length} contacts:\n`);
        
        result.people.forEach((person, idx) => {
          console.log(`   ${idx + 1}. ${person.name || 'N/A'}`);
          console.log(`      Title: ${person.title || 'N/A'}`);
          console.log(`      Email: ${person.email || 'N/A'}`);
          console.log(`      LinkedIn: ${person.linkedin_url || 'N/A'}`);
          console.log(`      Email Status: ${person.email_status || 'N/A'}`);
          console.log('');
        });
      } else {
        console.log(`   ❌ No contacts found`);
        if (result.error) {
          console.log(`   Error: ${result.error}`);
        }
      }
      
      // Rate limit: wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n✅ Apollo enrichment complete');
}

enrichFirms()
  .catch(err => console.error('Fatal error:', err));
