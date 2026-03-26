const axios = require('axios');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function testSearch() {
  try {
    // Test with a simpler search - just company name
    const payload = {
      q_organization_name: 'Gryphon Investors',
      per_page: 5
    };

    console.log('Testing Apollo API search...');
    console.log('Payload:', JSON.stringify(payload, null, 2));

    const response = await axios.post(
      'https://api.apollo.io/v1/mixed_people/api_search',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );

    console.log('\n✅ Response received');
    console.log('Total results:', response.data.pagination?.total_entries || 0);
    console.log('\nPeople found:', response.data.people?.length || 0);
    
    if (response.data.people && response.data.people.length > 0) {
      console.log('\nFirst 3 results:');
      response.data.people.slice(0, 3).forEach((p, idx) => {
        console.log(`\n${idx + 1}. ${p.name}`);
        console.log(`   Title: ${p.title || '(none)'}`);
        console.log(`   Email: ${p.email || '(none)'}`);
        console.log(`   Email status: ${p.email_status || '(none)'}`);
        console.log(`   LinkedIn: ${p.linkedin_url || '(none)'}`);
      });
    }

    console.log('\n\nFull response:');
    console.log(JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testSearch();
