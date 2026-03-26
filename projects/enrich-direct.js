const https = require('https');

const APOLLO_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

function apolloPost(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.apollo.io', path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': APOLLO_KEY, 'Content-Length': data.length }
    }, res => {
      let chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
        catch(e) { reject(new Error(Buffer.concat(chunks).toString())); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function searchByCompany(companyName) {
  console.log(`\n=== Searching: ${companyName} ===`);
  
  try {
    const searchRes = await apolloPost('/api/v1/mixed_people/search', {
      q_organization_name: companyName,
      person_titles: [
        'CEO', 'CTO', 'COO', 'CFO', 'CMO',
        'Partner', 'Managing Partner', 'Managing Director', 'General Partner',
        'VP', 'Vice President', 'Senior Vice President',
        'Director', 'Managing Director',
        'Head of', 'President', 'Founder', 'Co-Founder'
      ],
      page: 1,
      per_page: 10
    });
    
    const people = searchRes.people || [];
    console.log(`  Found ${people.length} people`);
    
    if (!people.length) return null;
    
    // Filter for verified emails
    const verified = people.filter(p => p.email && p.email_status === 'verified');
    console.log(`  ${verified.length} with verified emails`);
    
    if (verified.length) {
      const top = verified[0];
      console.log(`  ✓ ${top.name} - ${top.title}`);
      console.log(`    Email: ${top.email}`);
      console.log(`    LinkedIn: ${top.linkedin_url || 'N/A'}`);
      return {
        name: top.name,
        title: top.title,
        email: top.email,
        linkedin: top.linkedin_url
      };
    }
    
    return null;
  } catch(e) {
    console.log(`  ❌ Error: ${e.message}`);
    return null;
  }
}

async function main() {
  const targets = [
    'Nexa Equity',
    'Pearl Energy Investments',
    'Ribbit Capital',
    'Reach Capital',
    'Pioneer Fund',
    'PineBridge Investments'
  ];
  
  for (const name of targets) {
    await searchByCompany(name);
    await sleep(1500);
  }
}

main().catch(console.error);
