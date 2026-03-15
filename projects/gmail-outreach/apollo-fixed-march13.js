// Apollo API with correct header
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
      q_organization_domains: domain,
      page: 1,
      per_page: 10,
      person_seniorities: ['c_suite', 'partner', 'vp', 'director', 'manager']
    });

    const options = {
      hostname: 'api.apollo.io',
      path: '/v1/mixed_people/search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length,
        'X-Api-Key': API_KEY
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          console.error('Parse error:', e.message);
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
  console.log('\n=== Apollo Enrichment - March 13, 2026 @ 5:42 PM ===\n');

  for (const firm of firms) {
    console.log(`\n🔍 ${firm.name} (${firm.domain})`);
    
    try {
      const result = await searchApollo(firm.domain);
      
      if (result.error) {
        console.log(`   ❌ Error: ${result.error}`);
        continue;
      }
      
      if (result.people && result.people.length > 0) {
        console.log(`   ✅ Found ${result.people.length} contacts\n`);
        
        result.people.slice(0, 5).forEach((person, i) => {
          const name = person.name || 'Unknown';
          const title = person.title || 'Unknown';
          const email = person.email || '(not available)';
          const linkedin = person.linkedin_url || '';
          
          console.log(`   ${i+1}. ${name}`);
          console.log(`      ${title}`);
          if (email !== '(not available)') {
            console.log(`      ✉️  ${email}`);
          }
          if (linkedin) {
            console.log(`      🔗 ${linkedin}`);
          }
          console.log('');
        });
      } else {
        console.log(`   ℹ️  No contacts found in Apollo`);
      }
      
      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 1200));
      
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n✅ Apollo search complete\n');
}

enrichFirms().catch(console.error);
