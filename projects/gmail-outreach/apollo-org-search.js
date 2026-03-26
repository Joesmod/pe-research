const https = require('https');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

const firms = [
  'Littlejohn',
  'Charlesbank Capital Partners',
  'PSG Equity',
  'TowerBrook Capital Partners',
  'Pritzker Private Capital',
  'Symphony Technology Group',
  'Trian Fund Management',
  'Prospect Capital Management',
  'CORE Industrial Partners',
  'Five Elms Capital',
];

async function searchOrganization(orgName) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      api_key: APOLLO_API_KEY,
      q_organization_name: orgName,
      page: 1,
      per_page: 1
    });

    const options = {
      hostname: 'api.apollo.io',
      path: '/v1/organizations/search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(responseData));
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

async function getPeopleFromOrg(orgId, titles) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      api_key: APOLLO_API_KEY,
      q_organization_id: orgId,
      person_titles: titles,
      page: 1,
      per_page: 10
    });

    const options = {
      hostname: 'api.apollo.io',
      path: '/v1/mixed_people/search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(responseData));
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

async function enrichFirms() {
  console.log('Apollo.io Organization & Contact Search');
  console.log('=' .repeat(70));

  for (const firm of firms) {
    try {
      console.log(`\nSearching: ${firm}...`);
      const orgResult = await searchOrganization(firm);
      
      if (orgResult.organizations && orgResult.organizations.length > 0) {
        const org = orgResult.organizations[0];
        console.log(`  ✓ Organization found:`);
        console.log(`    Name: ${org.name}`);
        console.log(`    Domain: ${org.primary_domain || 'N/A'}`);
        console.log(`    ID: ${org.id}`);

        // Now search for decision-makers in this org
        console.log(`\n  Searching for decision-makers...`);
        const peopleResult = await getPeopleFromOrg(org.id, [
          'CEO', 'Managing Partner', 'Managing Director', 
          'Partner', 'Co-Founder', 'President', 'CTO', 'COO'
        ]);

        if (peopleResult.people && peopleResult.people.length > 0) {
          console.log(`  ✓ Found ${peopleResult.people.length} contacts:`);
          peopleResult.people.slice(0, 5).forEach((person, idx) => {
            console.log(`\n    ${idx + 1}. ${person.name}`);
            console.log(`       Title: ${person.title || 'N/A'}`);
            console.log(`       Email: ${person.email || 'NOT AVAILABLE'}`);
            console.log(`       LinkedIn: ${person.linkedin_url || 'N/A'}`);
          });
        } else {
          console.log(`  ✗ No decision-makers found`);
        }

        await new Promise(resolve => setTimeout(resolve, 1500));
      } else {
        console.log(`  ✗ Organization NOT FOUND in Apollo`);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.log(`  ✗ ERROR: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('Search complete!');
}

enrichFirms().catch(console.error);
