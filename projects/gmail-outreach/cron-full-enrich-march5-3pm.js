const fs = require('fs');
const https = require('https');

const API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Read enrichment targets
const targets = JSON.parse(fs.readFileSync('enrichment-targets-cron-2026-03-05.json', 'utf8'));

/**
 * Search for contacts at a company
 */
async function searchContacts(orgName) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      q_organization_name: orgName,
      person_titles: [
        'Partner', 'Managing Director', 'Managing Partner', 'General Partner',
        'CEO', 'COO', 'CTO', 'CFO',
        'Operating Partner', 'VP', 'Vice President', 'Director'
      ],
      page: 1,
      per_page: 5
    });

    const options = {
      hostname: 'api.apollo.io',
      path: '/api/v1/mixed_people/api_search',
      method: 'POST',
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        'X-Api-Key': API_KEY,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(responseData));
          } catch (err) {
            reject(new Error(`Parse error: ${err.message}`));
          }
        } else {
          reject(new Error(`API status ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

/**
 * Enrich a contact to get full email
 */
async function enrichContact(apolloId) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      id: apolloId,
      reveal_personal_emails: false,
      reveal_phone_number: false
    });

    const options = {
      hostname: 'api.apollo.io',
      path: '/api/v1/people/match',
      method: 'POST',
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        'X-Api-Key': API_KEY,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(responseData));
          } catch (err) {
            reject(new Error(`Parse error: ${err.message}`));
          }
        } else {
          reject(new Error(`API status ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function enrichFirms() {
  const enrichments = [];
  
  console.log(`\n=== PE ENRICHMENT CRON - ${new Date().toISOString()} ===\n`);
  console.log('Searching for decision-makers at 15 PE firms...\n');
  
  for (let i = 0; i < Math.min(15, targets.length); i++) {
    const firm = targets[i];
    console.log(`[${i+1}/15] ${firm['Company Name']}`);
    
    try {
      // Step 1: Search for contacts
      const searchResults = await searchContacts(firm['Company Name']);
      
      if (!searchResults.people || searchResults.people.length === 0) {
        console.log('   ⚠ No contacts found\n');
        continue;
      }
      
      console.log(`   Found ${searchResults.people.length} contacts`);
      
      // Step 2: Enrich top 2 contacts to get emails
      for (let j = 0; j < Math.min(2, searchResults.people.length); j++) {
        const person = searchResults.people[j];
        
        if (!person.has_email) {
          console.log(`   ⚠ ${person.first_name} ${person.last_name_obfuscated} - no email`);
          continue;
        }
        
        try {
          const enriched = await enrichContact(person.id);
          
          if (enriched.person && enriched.person.email) {
            console.log(`   ✅ ${enriched.person.name} (${enriched.person.title})`);
            console.log(`      ${enriched.person.email}`);
            console.log(`      ${enriched.person.linkedin_url || 'No LinkedIn'}`);
            
            enrichments.push({
              row: firm._row,
              company: firm['Company Name'],
              contactName: enriched.person.name,
              title: enriched.person.title,
              email: enriched.person.email,
              linkedin: enriched.person.linkedin_url,
              source: 'Apollo API enrichment',
              apolloId: person.id
            });
            
            break; // Got one good contact, move to next firm
          }
        } catch (enrichErr) {
          console.log(`   ⚠ Enrich failed: ${enrichErr.message}`);
        }
        
        // Rate limit between enrichments
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log('');
    
    // Rate limit between firms
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Save results
  const timestamp = new Date().toISOString().slice(0, 16).replace(/[:.T]/g, '-');
  const filename = `enrichment-results-${timestamp}.json`;
  fs.writeFileSync(filename, JSON.stringify(enrichments, null, 2));
  
  console.log(`\n=== ENRICHMENT COMPLETE ===`);
  console.log(`✅ Enriched ${enrichments.length} firms with verified contacts`);
  console.log(`📄 Results: ${filename}\n`);
  
  return enrichments;
}

enrichFirms().catch(console.error);
