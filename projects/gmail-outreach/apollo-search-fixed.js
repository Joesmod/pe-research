// Apollo.io People Search - FIXED with correct API key header
const https = require('https');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function searchPeople(companyName, titles) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      q_organization_name: companyName,
      person_titles: titles,
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
        'Content-Length': postData.length,
        'X-Api-Key': APOLLO_API_KEY,
        'Cache-Control': 'no-cache'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
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

async function main() {
  const searches = [
    { company: 'Blue Star Innovation Partners', titles: ['Managing Partner', 'CEO', 'Partner', 'Founder'] },
    { company: 'Huron Capital', titles: ['Managing Partner', 'Partner', 'CEO'] },
    { company: 'General Atlantic', titles: ['Managing Director', 'Partner'] }
  ];
  
  console.log('Searching Apollo.io for verified PE contacts (FIXED)...\n');
  
  for (const search of searches) {
    console.log(`=== ${search.company} ===`);
    try {
      const result = await searchPeople(search.company, search.titles);
      
      if (result.error) {
        console.log(`❌ API Error: ${result.error}`);
      } else if (result.people && result.people.length > 0) {
        console.log(`Found ${result.people.length} contacts:\n`);
        result.people.slice(0, 5).forEach(person => {
          console.log(`✅ ${person.name || person.first_name + ' ' + person.last_name}`);
          console.log(`   Title: ${person.title || '(not available)'}`);
          console.log(`   Email: ${person.email || '(not available)'}`);
          console.log(`   LinkedIn: ${person.linkedin_url || '(not available)'}`);
          console.log('');
        });
      } else {
        console.log(`❌ No contacts found`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    console.log('');
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
}

main();
