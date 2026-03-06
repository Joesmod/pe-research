const axios = require('axios');
const fs = require('fs');

// Read and clean the API key
const apiKeyRaw = fs.readFileSync('hunter-api-key.txt', 'utf8');
const HUNTER_API_KEY = apiKeyRaw.replace(/[^a-f0-9]/g, '');

console.log('Hunter.io API Key (cleaned):', HUNTER_API_KEY);

async function testHunter() {
  try {
    // Test 1: Check account info
    console.log('\n=== Testing Hunter.io API ===');
    console.log('Checking account status...\n');
    
    const accountResponse = await axios.get(`https://api.hunter.io/v2/account?api_key=${HUNTER_API_KEY}`);
    
    console.log('Account Status:');
    console.log(JSON.stringify(accountResponse.data, null, 2));
    
    const { data } = accountResponse.data;
    if (data) {
      console.log(`\nCredits:${data.requests.searches.available}/${data.requests.searches.available + data.requests.searches.used} searches`);
      console.log(`Verifications: ${data.requests.verifications.available}/${data.requests.verifications.available + data.requests.verifications.used}`);
    }
    
    // Test 2: Try domain search for a sample company
    if (data && data.requests.searches.available > 0) {
      console.log('\n\nTesting domain search for Ribbit Capital...');
      const searchResponse = await axios.get(`https://api.hunter.io/v2/domain-search?domain=ribbitcap.com&api_key=${HUNTER_API_KEY}`);
      
      console.log('\nDomain Search Result:');
      const emails = searchResponse.data.data.emails || [];
      console.log(`Found ${emails.length} emails`);
      emails.slice(0, 3).forEach(email => {
        console.log(`- ${email.value} (${email.first_name} ${email.last_name}) - ${email.position || 'N/A'}`);
      });
    } else {
      console.log('\n⚠️ No search credits available - skipping domain search test');
    }
    
  } catch (error) {
    console.error('Error:', error.response?.status, error.response?.data || error.message);
  }
}

testHunter();
