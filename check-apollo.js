const API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Check what we get back for a well-known firm
async function test() {
  // Test org search for a big firm
  const orgResp = await fetch('https://api.apollo.io/api/v1/mixed_companies/search', {
    method: 'POST',
    headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ q_organization_name: 'Thoma Bravo', per_page: 1 })
  });
  const orgData = await orgResp.json();
  console.log('ORG SEARCH (Thoma Bravo):');
  if (orgData.organizations && orgData.organizations[0]) {
    const org = orgData.organizations[0];
    console.log('  Name:', org.name, '| Domain:', org.primary_domain, '| ID:', org.id);
    
    // Now search people
    const pResp = await fetch('https://api.apollo.io/api/v1/mixed_people/search', {
      method: 'POST',
      headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        organization_ids: [org.id],
        per_page: 5,
        person_seniorities: ['owner', 'founder', 'c_suite', 'partner'],
      })
    });
    const pData = await pResp.json();
    console.log('\nPEOPLE SEARCH:');
    console.log('  Total:', pData.pagination?.total_entries);
    if (pData.people) {
      pData.people.forEach(p => {
        console.log(`  ${p.first_name} ${p.last_name} | ${p.title} | email: ${p.email || 'NONE'} | reveal: ${p.email_status}`);
      });
    }
  } else {
    console.log('  No org found');
    console.log(JSON.stringify(orgData).slice(0, 500));
  }

  // Also check our credit usage
  console.log('\n--- API Usage ---');
  const usageResp = await fetch('https://api.apollo.io/api/v1/auth/health', {
    headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' }
  });
  console.log(await usageResp.json());
}

test().catch(console.error);
