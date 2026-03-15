// Apollo API people search (correct endpoint)
const https = require('https');

const API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

const firms = [
  { name: 'Audax Private Equity', domain: 'audaxprivateequity.com' },
  { name: 'Bow River Capital', domain: 'bowrivercapital.com' },
  { name: 'Bruin Capital', domain: 'bruincptl.com' },
  { name: 'Butterfly Equity', domain: 'bfly.com' },
  { name: 'Callais Capital', domain: 'callaiscapital.com' },
  { name: 'Character Capital', domain: 'character.vc' }
];

async function searchApollo(domain) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      organization_domains: [domain],
      person_seniorities: ['c_suite', 'partner', 'vp', 'director'],
      page: 1,
      per_page: 10
    });

    const options = {
      hostname: 'api.apollo.io',
      path: '/api/v1/mixed_people/api_search',
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
  console.log('\n=== Apollo API Search - March 13, 2026 @ 5:43 PM ===\n');

  const enrichedContacts = [];

  for (const firm of firms) {
    console.log(`\n🔍 ${firm.name}`);
    
    try {
      const result = await searchApollo(firm.domain);
      
      if (result.error) {
        console.log(`   ❌ ${result.error}`);
        continue;
      }
      
      if (result.people && result.people.length > 0) {
        console.log(`   ✅ ${result.people.length} contacts found\n`);
        
        result.people.slice(0, 5).forEach((person, i) => {
          const name = person.name || 'Unknown';
          const title = person.title || 'Unknown';
          const email = person.email || null;
          const linkedin = person.linkedin_url || '';
          
          console.log(`   ${i+1}. ${name}`);
          console.log(`      ${title}`);
          if (email) {
            console.log(`      ✉️  ${email}`);
            enrichedContacts.push({
              firm: firm.name,
              domain: firm.domain,
              name,
              title,
              email,
              linkedin
            });
          } else {
            console.log(`      ✉️  (email not available)`);
          }
          if (linkedin) {
            console.log(`      🔗 ${linkedin.substring(0, 60)}...`);
          }
          console.log('');
        });
      } else {
        console.log(`   ℹ️  No contacts found`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
    } catch (error) {
      console.error(`   ❌ ${error.message}`);
    }
  }
  
  console.log(`\n\n📊 Summary: Found ${enrichedContacts.length} contacts with verified emails\n`);
  
  if (enrichedContacts.length > 0) {
    console.log('Contacts with emails:');
    enrichedContacts.forEach((c, i) => {
      console.log(`${i+1}. ${c.name} - ${c.title} @ ${c.firm}`);
      console.log(`   ${c.email}\n`);
    });
  }
  
  console.log('\n✅ Complete\n');
}

enrichFirms().catch(console.error);
