// Debug Apollo API Response
const https = require('https');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function searchApollo(companyName, titles) {
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
      path: '/v1/mixed_people/api_search',
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
  console.log('🔍 Debugging Apollo API Response...\n');
  
  const companyName = 'Backstroke';
  const titles = ['CEO', 'CTO', 'Managing Partner', 'Partner'];
  
  console.log(`Searching for: ${companyName}`);
  console.log(`Titles: ${titles.join(', ')}\n`);
  
  try {
    const result = await searchApollo(companyName, titles);
    
    console.log('📄 FULL API RESPONSE:');
    console.log('='.repeat(60));
    console.log(JSON.stringify(result, null, 2));
    console.log('='.repeat(60));
    
    if (result.people && result.people.length > 0) {
      console.log(`\n✅ Found ${result.people.length} contacts\n`);
      
      result.people.forEach((person, idx) => {
        console.log(`Contact #${idx + 1}:`);
        console.log(`  Name: ${person.name || person.first_name + ' ' + person.last_name}`);
        console.log(`  Title: ${person.title || '(none)'}`);
        console.log(`  Email: ${person.email || '(none)'}`);
        console.log(`  LinkedIn: ${person.linkedin_url || '(none)'}`);
        console.log(`  Keys:`, Object.keys(person).join(', '));
        console.log();
      });
    } else {
      console.log('\n⚠️  No people found in response');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main();
