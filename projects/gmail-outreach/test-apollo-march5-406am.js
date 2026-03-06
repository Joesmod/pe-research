const https = require('https');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

function apolloOrgSearch(companyName) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      api_key: APOLLO_API_KEY,
      q_organization_name: companyName
    });

    const options = {
      hostname: 'api.apollo.io',
      port: 443,
      path: '/v1/organizations/search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Body:', body);
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function apolloPeopleSearch(companyDomain) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      api_key: APOLLO_API_KEY,
      q_organization_domains: [companyDomain],
      page: 1,
      per_page: 5,
      person_titles: ["Partner", "Managing Director", "COO", "CTO", "VP"]
    });

    const options = {
      hostname: 'api.apollo.io',
      port: 443,
      path: '/v1/mixed_people/search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Body:', body.substring(0, 500));
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function test() {
  console.log('=== Testing Apollo API ===\n');
  
  // Test 1: Search for a well-known PE firm
  console.log('Test 1: Searching for organization "3G Capital"...\n');
  try {
    const orgResult = await apolloOrgSearch('3G Capital');
    console.log('\nOrg search result:', JSON.stringify(orgResult, null, 2).substring(0, 1000));
    
    if (orgResult.organizations && orgResult.organizations.length > 0) {
      const org = orgResult.organizations[0];
      console.log(`\nFound org: ${org.name}`);
      console.log(`Domain: ${org.primary_domain}`);
      
      // Test 2: Search for people at that org
      if (org.primary_domain) {
        console.log(`\n\nTest 2: Searching for people at ${org.primary_domain}...\n`);
        const peopleResult = await apolloPeopleSearch(org.primary_domain);
        console.log('\nPeople search result:', JSON.stringify(peopleResult, null, 2).substring(0, 1000));
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
