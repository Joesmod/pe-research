const axios = require('axios');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function testOrganizationSearch() {
  console.log('Testing Organization Search Endpoint...\n');
  
  try {
    const response = await axios.post(
      'https://api.apollo.io/api/v1/organizations/search',
      {
        q_organization_domains: ['lycap.com'],
        per_page: 1
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );
    
    console.log('Organization Search SUCCESS:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.log('Organization Search FAILED:', error.response?.status, error.response?.data);
    return false;
  }
}

async function testPeopleSearch() {
  console.log('\nTesting People Search Endpoint (simple)...\n');
  
  try {
    const response = await axios.post(
      'https://api.apollo.io/api/v1/mixed_people/search',
      {
        q_organization_domains: ['lycap.com'],
        per_page: 3
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );
    
    console.log('People Search SUCCESS');
    console.log('Found:', response.data.people?.length || 0, 'people');
    if (response.data.people && response.data.people.length > 0) {
      response.data.people.forEach(p => {
        console.log(`  - ${p.first_name} ${p.last_name} (${p.title || 'No title'}) - ${p.email || 'No email'}`);
      });
    }
    return true;
  } catch (error) {
    console.log('People Search FAILED:', error.response?.status, error.response?.data);
    return false;
  }
}

async function testOrganizationEnrichment() {
  console.log('\nTesting Organization Enrichment Endpoint...\n');
  
  try {
    const response = await axios.get(
      'https://api.apollo.io/api/v1/organizations/enrich',
      {
        params: {
          domain: 'lycap.com'
        },
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );
    
    console.log('Organization Enrichment SUCCESS');
    console.log('Company:', response.data.organization?.name);
    console.log('Domain:', response.data.organization?.primary_domain);
    return true;
  } catch (error) {
    console.log('Organization Enrichment FAILED:', error.response?.status, error.response?.data);
    return false;
  }
}

async function main() {
  console.log('🔍 Testing Apollo API Endpoints (March 25, 2026)\n');
  console.log('='.repeat(60));
  
  await testOrganizationSearch();
  await new Promise(r => setTimeout(r, 1000));
  
  await testPeopleSearch();
  await new Promise(r => setTimeout(r, 1000));
  
  await testOrganizationEnrichment();
  
  console.log('\n' + '='.repeat(60));
  console.log('\n✓ Testing complete\n');
}

main().catch(console.error);
