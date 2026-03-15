const https = require('https');
const fs = require('fs');

const API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

function apolloMatch(firstName, lastName, organization) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      first_name: firstName,
      last_name: lastName,
      organization_name: organization
    });
    
    const options = {
      hostname: 'api.apollo.io',
      port: 443,
      path: '/v1/people/match',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': API_KEY,
        'Content-Length': data.length
      }
    };
    
    const req = https.request(options, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
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

async function enrichTargets() {
  const targets = JSON.parse(fs.readFileSync('enrich-targets-march7-1136pm.json', 'utf-8'));
  
  const enriched = [];
  
  for (const target of targets) {
    if (!target.contact || !target.company) continue;
    
    console.log(`\nSearching for ${target.contact} at ${target.company}...`);
    
    const [firstName, ...lastNameParts] = target.contact.split(' ');
    const lastName = lastNameParts.join(' ');
    
    try {
      const result = await apolloMatch(firstName, lastName, target.company);
      
      if (result.person && result.person.email) {
        console.log(`✅ Found: ${result.person.email}`);
        console.log(`   Title: ${result.person.title || 'N/A'}`);
        console.log(`   LinkedIn: ${result.person.linkedin_url || 'N/A'}`);
        
        enriched.push({
          rowIndex: target.rowIndex,
          company: target.company,
          contact: target.contact,
          email: result.person.email,
          title: result.person.title || '',
          linkedin: result.person.linkedin_url || '',
          source: 'Apollo API'
        });
      } else {
        console.log(`❌ No email found`);
      }
    } catch (err) {
      console.log(`❌ Error: ${err.message}`);
    }
    
    // Rate limit: 1 request per second
    await new Promise(resolve => setTimeout(resolve, 1100));
  }
  
  console.log(`\n\n=== ENRICHMENT RESULTS ===`);
  console.log(`Successfully enriched: ${enriched.length} leads`);
  
  fs.writeFileSync('enrichment-results-march7-1136pm.json', JSON.stringify(enriched, null, 2));
  
  return enriched;
}

enrichTargets().catch(console.error);
