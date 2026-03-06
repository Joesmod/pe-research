const https = require('https');
const fs = require('fs');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Search for people at a company with specific titles
async function searchPeople(companyName, titles) {
  const payload = JSON.stringify({
    q_organization_name: companyName,
    person_titles: titles,
    page: 1,
    per_page: 5
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.apollo.io',
      path: '/v1/mixed_people/search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': APOLLO_API_KEY,
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// Main enrichment function
async function enrichFirm(firmData) {
  console.log(`\n=== Searching: ${firmData.company} (Row ${firmData.rowIndex + 1}) ===`);
  
  const titles = [
    'Managing Partner',
    'General Partner',
    'Partner',
    'CEO',
    'President',
    'Founder',
    'Managing Director',
    'Director',
    'Chief',
    'VP',
    'Head of'
  ];

  try {
    const result = await searchPeople(firmData.company, titles);
    
    if (result.people && result.people.length > 0) {
      console.log(`Found ${result.people.length} contacts:\n`);
      
      const contacts = [];
      result.people.forEach((person, i) => {
        const email = person.email || person.sanitized_email || '';
        const hasValidEmail = email && !email.match(/^(info|sales|ir|contact|admin|general)@/i);
        
        console.log(`${i + 1}. ${person.name || 'N/A'}`);
        console.log(`   Title: ${person.title || 'N/A'}`);
        console.log(`   Email: ${email || 'N/A'}`);
        console.log(`   LinkedIn: ${person.linkedin_url || 'N/A'}`);
        console.log('');
        
        if (hasValidEmail) {
          contacts.push({
            name: person.name,
            title: person.title,
            email: email,
            linkedin: person.linkedin_url
          });
        }
      });
      
      return contacts;
    } else {
      console.log('No contacts found');
      return [];
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return [];
  }
}

// Read targets and enrich
(async () => {
  const targets = JSON.parse(fs.readFileSync('enrichment-targets-march5-136am-v2.json', 'utf8'));
  const results = [];
  
  console.log(`Starting Apollo enrichment for ${targets.length} firms...\n`);
  
  for (const target of targets) {
    // Skip if company name is empty or it's a dead lead
    if (!target.company || target.status === 'Dead Lead') {
      console.log(`Skipping: ${target.company || 'EMPTY'} (${target.status})`);
      results.push({
        ...target,
        contacts: [],
        apolloStatus: 'skipped'
      });
      continue;
    }
    
    const contacts = await enrichFirm(target);
    results.push({
      ...target,
      contacts,
      apolloStatus: contacts.length > 0 ? 'found' : 'not_found'
    });
    
    // Rate limit: wait 1.5 seconds between requests
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  // Save results
  fs.writeFileSync('apollo-enrichment-march5-136am.json', JSON.stringify(results, null, 2));
  
  console.log('\n=== ENRICHMENT COMPLETE ===');
  const found = results.filter(r => r.apolloStatus === 'found').length;
  const notFound = results.filter(r => r.apolloStatus === 'not_found').length;
  const skipped = results.filter(r => r.apolloStatus === 'skipped').length;
  
  console.log(`Total firms: ${results.length}`);
  console.log(`Found contacts: ${found}`);
  console.log(`No contacts found: ${notFound}`);
  console.log(`Skipped: ${skipped}`);
  console.log('\nResults saved to: apollo-enrichment-march5-136am.json');
})();
