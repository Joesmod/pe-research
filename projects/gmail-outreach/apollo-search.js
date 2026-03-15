// Apollo.io People Search - Find verified emails for PE contacts
const https = require('https');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function searchPerson(firstName, lastName, companyName) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      first_name: firstName,
      last_name: lastName,
      organization_name: companyName,
      api_key: APOLLO_API_KEY
    });
    
    const options = {
      hostname: 'api.apollo.io',
      port: 443,
      path: '/v1/people/match',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length,
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
    { first: 'Rob', last: 'Wechsler', company: 'Blue Star Innovation Partners' },
    { first: 'Dan', last: 'Wechsler', company: 'Blue Star Innovation Partners' },
    { first: 'Jim', last: 'Mahoney', company: 'Huron Capital' },
    { first: 'Brian', last: 'Demkowicz', company: 'Huron Capital' }
  ];
  
  console.log('Searching Apollo.io for verified PE contacts...\n');
  
  for (const search of searches) {
    console.log(`Searching: ${search.first} ${search.last} @ ${search.company}`);
    try {
      const result = await searchPerson(search.first, search.last, search.company);
      
      if (result.person) {
        const { name, title, email, linkedin_url, organization } = result.person;
        console.log(`✅ FOUND: ${name}`);
        console.log(`   Title: ${title}`);
        console.log(`   Email: ${email || '(not available)'}`);
        console.log(`   LinkedIn: ${linkedin_url || '(not available)'}`);
        console.log(`   Company: ${organization?.name || search.company}`);
      } else {
        console.log(`❌ No match found`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    console.log('');
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

main();
