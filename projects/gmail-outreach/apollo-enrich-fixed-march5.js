const https = require('https');
const fs = require('fs');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Search for people at a company - using correct API endpoint
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
      path: '/v1/mixed_people/api_search',  // Correct endpoint
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
          console.error('Parse error:', e.message);
          console.error('Data:', data);
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
    'Principal',
    'Director',
    'VP Operations',
    'VP Portfolio',
    'Head of Portfolio'
  ];

  try {
    const result = await searchPeople(firmData.company, titles);
    
    if (result.people && result.people.length > 0) {
      console.log(`✓ Found ${result.people.length} contacts:\n`);
      
      const contacts = [];
      result.people.forEach((person, i) => {
        const email = person.email || person.sanitized_email || '';
        const hasValidEmail = email && !email.match(/^(info|sales|ir|contact|admin|general)@/i);
        
        console.log(`  ${i + 1}. ${person.name || 'N/A'}`);
        console.log(`     Title: ${person.title || 'N/A'}`);
        console.log(`     Email: ${email || 'N/A'}`);
        console.log(`     LinkedIn: ${person.linkedin_url || 'N/A'}`);
        console.log('');
        
        if (person.name && person.title) {
          contacts.push({
            name: person.name,
            title: person.title,
            email: email || null,
            linkedin: person.linkedin_url || null,
            hasEmail: !!email && hasValidEmail
          });
        }
      });
      
      return contacts;
    } else {
      console.log('✗ No contacts found');
      return [];
    }
  } catch (error) {
    console.error(`✗ Error: ${error.message}`);
    return [];
  }
}

// Read targets and enrich
(async () => {
  const targets = JSON.parse(fs.readFileSync('real-pe-targets-march5-136am.json', 'utf8'));
  const results = [];
  
  console.log(`\n╔════════════════════════════════════════╗`);
  console.log(`║  Apollo Enrichment - Real PE Firms     ║`);
  console.log(`║  ${targets.length} firms to process                 ║`);
  console.log(`╚════════════════════════════════════════╝\n`);
  
  for (const target of targets) {
    const contacts = await enrichFirm(target);
    results.push({
      ...target,
      contacts,
      apolloStatus: contacts.length > 0 ? 'found' : 'not_found',
      enrichedAt: new Date().toISOString()
    });
    
    // Rate limit: wait 1.5 seconds between requests
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  // Save results
  fs.writeFileSync('apollo-enrichment-real-pe-march5-FINAL.json', JSON.stringify(results, null, 2));
  
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║       ENRICHMENT COMPLETE              ║');
  console.log('╚════════════════════════════════════════╝\n');
  
  const found = results.filter(r => r.apolloStatus === 'found').length;
  const notFound = results.filter(r => r.apolloStatus === 'not_found').length;
  const totalContacts = results.reduce((sum, r) => sum + r.contacts.length, 0);
  const contactsWithEmail = results.reduce((sum, r) => 
    sum + r.contacts.filter(c => c.hasEmail).length, 0);
  
  console.log(`📊 Results:`);
  console.log(`   Total firms processed: ${results.length}`);
  console.log(`   ✓ Firms with contacts: ${found}`);
  console.log(`   ✗ No contacts found: ${notFound}`);
  console.log(`   📧 Total contacts found: ${totalContacts}`);
  console.log(`   ✉️  Contacts with verified email: ${contactsWithEmail}`);
  console.log(`\n💾 Results saved to: apollo-enrichment-real-pe-march5-FINAL.json`);
  
  // Show top contacts found
  if (contactsWithEmail > 0) {
    console.log('\n📋 Contacts with verified emails:');
    let shown = 0;
    for (const result of results) {
      const emailContacts = result.contacts.filter(c => c.hasEmail);
      if (emailContacts.length > 0 && shown < 10) {
        for (const contact of emailContacts.slice(0, 2)) {
          console.log(`\n   ${result.company}:`);
          console.log(`   • ${contact.name} - ${contact.title}`);
          console.log(`   • ${contact.email}`);
          shown++;
          if (shown >= 10) break;
        }
      }
    }
  }
})();
