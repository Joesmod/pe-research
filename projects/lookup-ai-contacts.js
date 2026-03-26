// Quick Apollo lookup for specific AI-titled contacts
const https = require('https');
const APOLLO_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

function apolloPost(path, body) {
  const data = JSON.stringify(body);
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.apollo.io', path, method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_KEY,
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(responseData)); }
        catch (e) { reject(new Error(`Parse error: ${responseData.slice(0,200)}`)); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function lookupFirm(companyName, personName, personTitle) {
  console.log(`\n=== ${companyName}: ${personName} (${personTitle}) ===`);
  
  // Step 1: Find org
  const orgRes = await apolloPost('/api/v1/mixed_companies/search', {
    q_organization_name: companyName,
    page: 1,
    per_page: 3
  });
  
  if (!orgRes.organizations || !orgRes.organizations.length) {
    console.log('❌ Company not found in Apollo');
    return null;
  }
  
  const org = orgRes.organizations[0];
  console.log(`Found org: ${org.name} (ID: ${org.id})`);
  
  // Step 2: Search for person by title keywords (AI, Data, Technology, etc)
  const titleKeywords = ['AI', 'Data', 'Technology', 'Digital', 'Chief', 'Operating', 'MD', 'Partner'];
  
  const peopleRes = await apolloPost('/api/v1/mixed_people/api_search', {
    organization_ids: [org.id],
    person_seniorities: ['senior', 'executive', 'c_suite'],
    page: 1,
    per_page: 20
  });
  
  if (!peopleRes.people || !peopleRes.people.length) {
    console.log(`❌ No senior contacts found in Apollo for this org`);
    return null;
  }
  
  console.log(`\nFound ${peopleRes.people.length} senior contacts:`);
  
  // Find best match by name OR title similarity
  const [firstName, ...lastParts] = personName.split(' ');
  const lastName = lastParts.join(' ');
  
  let person = peopleRes.people.find(p => 
    p.name && firstName && lastName &&
    p.name.toLowerCase().includes(firstName.toLowerCase()) &&
    p.name.toLowerCase().includes(lastName.toLowerCase())
  );
  
  if (!person) {
    // Try title matching
    person = peopleRes.people.find(p => 
      p.title && titleKeywords.some(kw => p.title.toLowerCase().includes(kw.toLowerCase()))
    );
  }
  
  if (!person) {
    // Show what we found
    peopleRes.people.slice(0, 5).forEach(p => {
      console.log(`  - ${p.name}: ${p.title || 'no title'}`);
    });
    console.log(`\n❌ ${personName} not found by name or title match`);
    return null;
  }
  
  console.log(`Found person: ${person.name} (${person.title || 'no title'})`);
  
  // Step 3: Enrich to get email + LinkedIn
  const enrichRes = await apolloPost('/api/v1/people/match', {
    id: person.id
  });
  
  const enriched = enrichRes.person;
  if (!enriched) {
    console.log('❌ Enrichment failed');
    return null;
  }
  
  console.log(`✅ Email: ${enriched.email || 'NOT AVAILABLE'}`);
  console.log(`✅ LinkedIn: ${enriched.linkedin_url || 'NOT AVAILABLE'}`);
  console.log(`✅ Title: ${enriched.title || 'N/A'}`);
  
  return {
    company: companyName,
    name: enriched.name,
    title: enriched.title,
    email: enriched.email,
    linkedin: enriched.linkedin_url
  };
}

// Lookup the 3 AI-titled contacts
(async () => {
  const targets = [
    { company: 'Waud Capital', name: 'Prithvi Raj', title: 'Chief AI & Data Officer' },
    { company: 'Kohlberg & Co', name: 'Michael Bogobowicz', title: 'Operating Exec, AI & Data' },
    { company: 'Revelstoke Capital Partners', name: 'Bob Hughes', title: 'MD Technology, PTG' }
  ];
  
  const results = [];
  
  for (const target of targets) {
    try {
      const result = await lookupFirm(target.company, target.name, target.title);
      if (result) results.push(result);
      await new Promise(r => setTimeout(r, 300)); // Rate limiting
    } catch (err) {
      console.error(`ERROR for ${target.company}:`, err.message);
    }
  }
  
  console.log('\n\n=== SUMMARY ===\n');
  results.forEach(r => {
    console.log(`${r.company} - ${r.name}`);
    console.log(`  ${r.title}`);
    console.log(`  ${r.email || 'NO EMAIL'}`);
    console.log(`  ${r.linkedin || 'NO LINKEDIN'}`);
    console.log('');
  });
  
  console.log(`\nFound ${results.filter(r => r.email).length}/${targets.length} with verified emails`);
})();
