const https = require('https');
const API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

function apolloPost(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.apollo.io', path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': API_KEY }
    }, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch(e) { reject(d); }
      });
    });
    req.on('error', reject);
    req.write(data); req.end();
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function findLinkedIn(name, company) {
  // Use people/match to find LinkedIn
  const res = await apolloPost('/api/v1/people/match', {
    name, organization_name: company, reveal_personal_emails: false
  });
  if (res.person) {
    console.log(`${name} @ ${company}:`);
    console.log(`  LinkedIn: ${res.person.linkedin_url || 'N/A'}`);
    console.log(`  Email: ${res.person.email || 'N/A'}`);
    return res.person.linkedin_url || null;
  } else {
    console.log(`${name} @ ${company}: NOT FOUND`);
    return null;
  }
}

async function discoverFirms() {
  // Search for mid-market PE firms we might not have
  const res = await apolloPost('/api/v1/mixed_companies/search', {
    q_organization_keyword_tags: ['private equity'],
    organization_num_employees_ranges: ['11,100'],
    per_page: 10,
    page: Math.floor(Math.random() * 5) + 1
  });
  console.log('\n--- New Firm Candidates ---');
  if (res.organizations) {
    res.organizations.forEach(o => {
      console.log(`${o.name} | ${o.website_url || 'no site'} | ${o.estimated_num_employees || '?'} employees | ${o.industry || 'N/A'}`);
    });
  } else {
    console.log('No results:', JSON.stringify(res).slice(0, 500));
  }
}

(async () => {
  // Fill LinkedIn URLs
  await findLinkedIn('Jack Glover', 'Incline Equity Partners');
  await sleep(500);
  await findLinkedIn('Eric O\'Brien', 'Seidler Equity Partners');
  await sleep(500);
  await findLinkedIn('Ali Evans', 'Metamora Growth Partners');
  await sleep(500);

  // Discover new firms
  await discoverFirms();
})();
