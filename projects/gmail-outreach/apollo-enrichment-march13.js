// Apollo API enrichment for PE firms
// API Key: Fx6RpQS0PKxfVgnxWOPWuw
const https = require('https');

const API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

const firms = [
  { name: 'Audax Private Equity', domain: 'audaxprivateequity.com' },
  { name: 'Bow River Capital', domain: 'bowrivercapital.com' },
  { name: 'Bruin Capital', domain: 'bruincptl.com' },
  { name: 'Butterfly Equity', domain: 'bfly.com' },
  { name: 'Character Capital', domain: 'character.vc' }
];

async function searchApollo(domain) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      api_key: API_KEY,
      organization_domains: [domain],
      person_titles: [
        'CEO', 'CTO', 'COO', 'Partner', 'Managing Partner',
        'General Partner', 'Managing Director', 'Director',
        'VP Technology', 'VP Operations', 'VP Digital',
        'Head of Technology', 'Head of Operations'
      ],
      page: 1,
      per_page: 10
    });

    const options = {
      hostname: 'api.apollo.io',
      path: '/v1/mixed_people/search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length,
        'Cache-Control': 'no-cache'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
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

async function enrichFirms() {
  console.log('\n=== Apollo Enrichment - March 13, 2026 @ 5:41 PM ===\n');

  for (const firm of firms) {
    console.log(`\n🔍 Searching ${firm.name} (${firm.domain})...`);
    
    try {
      const result = await searchApollo(firm.domain);
      
      if (result.people && result.people.length > 0) {
        console.log(`   Found ${result.people.length} contacts:\n`);
        
        result.people.slice(0, 5).forEach((person, i) => {
          console.log(`   ${i+1}. ${person.name || 'Unknown'}`);
          console.log(`      Title: ${person.title || 'Unknown'}`);
          console.log(`      Email: ${person.email || '(not available)'}`);
          console.log(`      LinkedIn: ${person.linkedin_url || '(none)'}`);
          console.log('');
        });
      } else {
        console.log(`   No contacts found`);
      }
      
      // Rate limit: wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`   Error: ${error.message}`);
    }
  }
  
  console.log('\n✅ Apollo search complete\n');
}

enrichFirms().catch(console.error);
