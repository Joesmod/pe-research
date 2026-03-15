const axios = require('axios');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function main() {
  console.log('Searching for Jim Mahoney at Huron Capital...\n');
  
  const payload = {
    first_name: 'Jim',
    last_name: 'Mahoney',
    organization_name: 'Huron Capital'
  };

  try {
    const response = await axios.post(
      'https://api.apollo.io/v1/people/match',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );

    if (response.data && response.data.person) {
      const person = response.data.person;
      console.log('FOUND:');
      console.log(`Name: ${person.first_name} ${person.last_name}`);
      console.log(`Title: ${person.title}`);
      console.log(`Email: ${person.email}`);
      console.log(`Email Status: ${person.email_status}`);
      console.log(`Phone: ${person.phone_numbers?.[0]?.sanitized_number || 'N/A'}`);
      console.log(`LinkedIn: ${person.linkedin_url || 'N/A'}`);
    } else {
      console.log('Not found in Apollo');
    }
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

main();
