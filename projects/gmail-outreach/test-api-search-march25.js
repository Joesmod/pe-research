const axios = require('axios');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function testApiSearch() {
  console.log('Testing mixed_people/api_search endpoint...\n');
  
  try {
    const response = await axios.post(
      'https://api.apollo.io/api/v1/mixed_people/api_search',
      {
        api_key: APOLLO_API_KEY,
        q_organization_domains: ['lycap.com'],
        page: 1,
        per_page: 5
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✓ SUCCESS');
    console.log('Found:', response.data.people?.length || 0, 'people\n');
    if (response.data.people && response.data.people.length > 0) {
      response.data.people.forEach(p => {
        console.log(`${p.first_name} ${p.last_name}`);
        console.log(`  Title: ${p.title || 'No title'}`);
        console.log(`  Email: ${p.email || 'No email'}`);
        console.log(`  Status: ${p.email_status || 'unknown'}\n`);
      });
    }
  } catch (error) {
    console.log('❌ FAILED:', error.response?.status);
    console.log('Error:', JSON.stringify(error.response?.data, null, 2));
  }
}

async function testWithHeaderAuth() {
  console.log('\nTesting with API key in header instead of body...\n');
  
  try {
    const response = await axios.post(
      'https://api.apollo.io/api/v1/mixed_people/api_search',
      {
        q_organization_domains: ['lycap.com'],
        page: 1,
        per_page: 5
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );
    
    console.log('✓ SUCCESS with header auth');
    console.log('Found:', response.data.people?.length || 0, 'people\n');
    if (response.data.people && response.data.people.length > 0) {
      response.data.people.forEach(p => {
        console.log(`${p.first_name} ${p.last_name}`);
        console.log(`  Title: ${p.title || 'No title'}`);
        console.log(`  Email: ${p.email || 'No email'}`);
        console.log(`  Status: ${p.email_status || 'unknown'}\n`);
      });
    }
  } catch (error) {
    console.log('❌ FAILED:', error.response?.status);
    console.log('Error:', JSON.stringify(error.response?.data, null, 2));
  }
}

async function main() {
  await testApiSearch();
  await new Promise(r => setTimeout(r, 1000));
  await testWithHeaderAuth();
}

main().catch(console.error);
