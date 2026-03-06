const axios = require('axios');
const fs = require('fs');

// Hunter.io API Key
const HUNTER_API_KEY = 'f9f608d7a2a768851220e8a2f6d3430d5242313';

async function testHunterDomainSearch(domain, company) {
  try {
    console.log(`\n🔍 Testing Hunter.io for: ${company}`);
    console.log(`   Domain: ${domain}`);
    
    const response = await axios.get('https://api.hunter.io/v2/domain-search', {
      params: {
        domain: domain,
        api_key: HUNTER_API_KEY,
        limit: 5
      }
    });

    if (response.data && response.data.data && response.data.data.emails) {
      const emails = response.data.data.emails;
      console.log(`   ✅ Found ${emails.length} emails`);
      
      // Filter for decision-makers
      const decisionMakers = emails.filter(e => {
        const title = (e.position || '').toLowerCase();
        return title.includes('partner') || 
               title.includes('ceo') || 
               title.includes('president') ||
               title.includes('managing') ||
               title.includes('director') ||
               title.includes('chief');
      });

      if (decisionMakers.length > 0) {
        console.log(`   📧 Decision-makers found:`);
        decisionMakers.forEach(e => {
          console.log(`      - ${e.first_name} ${e.last_name} (${e.position})`);
          console.log(`        Email: ${e.value}`);
          console.log(`        Confidence: ${e.confidence}%`);
        });
        return decisionMakers[0]; // Return top result
      }
    }
    
    console.log(`   ❌ No decision-makers found`);
    return null;
  } catch (error) {
    console.error(`   ⚠️ Hunter.io error:`, error.response?.data || error.message);
    return null;
  }
}

async function runTest() {
  console.log('=== Hunter.io API Test ===\n');
  
  const testFirms = [
    { domain: 'bindleycapital.com', company: 'Bindley Capital Partners' },
    { domain: 'giantleapcapital.com', company: 'GiantLeap Capital' },
    { domain: 'tau-investment.com', company: 'TAU Investment Management' }
  ];

  for (const firm of testFirms) {
    await testHunterDomainSearch(firm.domain, firm.company);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit
  }

  console.log('\n✅ Test complete');
}

runTest().catch(console.error);
