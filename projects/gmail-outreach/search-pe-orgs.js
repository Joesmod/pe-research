const axios = require('axios');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function searchPEOrganizations() {
  console.log('🔍 Searching for PE organizations via Apollo...\n');
  
  try {
    const response = await axios.post(
      'https://api.apollo.io/v1/organizations/search',
      {
        q_organization_keyword_tags: ['private equity', 'growth equity'],
        organization_num_employees_ranges: ['51-200', '201-500', '501-1000'],
        page: 1,
        per_page: 10
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );
    
    console.log('✅ Apollo response received');
    console.log('Organizations found:', response.data?.organizations?.length || 0);
    
    if (response.data && response.data.organizations) {
      const orgs = response.data.organizations.slice(0, 5);
      
      orgs.forEach((org, i) => {
        console.log(`\n${i + 1}. ${org.name}`);
        console.log(`   Website: ${org.website_url || 'N/A'}`);
        console.log(`   Industry: ${org.industry || 'N/A'}`);
        console.log(`   Employees: ${org.estimated_num_employees || 'N/A'}`);
      });
      
      return orgs;
    }
  } catch (error) {
    if (error.response) {
      console.error('Apollo API Error:', error.response.status, error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

searchPEOrganizations().catch(console.error);
