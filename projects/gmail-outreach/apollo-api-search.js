// Apollo.io People API Search - Using new api_search endpoint
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
      path: '/api/v1/mixed_people/search',  // New API endpoint
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length,
        'X-Api-Key': APOLLO_API_KEY
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
    { company: 'Huron Capital Partners', titles: ['Managing Partner', 'Partner'] },
    { company: 'General Atlantic', titles: ['Managing Director'] }
  ];
  
  console.log('Searching Apollo.io (new API endpoint)...\n');
  
  for (const search of searches) {
    console.log(`=== ${search.company} ===`);
    try {
      const result = await searchPeople(search.company, search.titles);
      
      if (result.error) {
        console.log(`❌ Error: ${result.error}`);
      } else if (result.people && result.people.length > 0) {
        console.log(`✅ Found ${result.people.length} contacts:\n`);
        result.people.slice(0, 5).forEach(person => {
          const name = person.name || `${person.first_name || ''} ${person.last_name || ''}`.trim();
          const email = person.email || '(not available)';
          const title = person.title || '(not available)';
          const linkedin = person.linkedin_url || '(not available)';
          
          console.log(`${name}`);
          console.log(`  Title: ${title}`);
          console.log(`  Email: ${email}`);
          console.log(`  LinkedIn: ${linkedin}`);
          console.log('');
        });
      } else {
        console.log(`❌ No contacts found`);
        console.log(`Response: ${JSON.stringify(result).substring(0, 200)}...`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    console.log('');
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  console.log('\nDone. Apollo API test complete.');
}

main();
