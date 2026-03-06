const fs = require('fs');
const https = require('https');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Read enrichment targets
const targets = JSON.parse(fs.readFileSync('enrichment-targets-cron-2026-03-05.json', 'utf8'));

async function searchApollo(companyName) {
  return new Promise((resolve, reject) => {
    const searchData = JSON.stringify({
      "q_organization_name": companyName,
      "person_titles": [
        "CEO", "CTO", "COO", "CMO", "CFO",
        "Managing Partner", "Managing Director", "General Partner", "Operating Partner",
        "Partner", "Director", "VP", "Vice President",
        "Head of Technology", "Head of Operations", "Head of Business Development",
        "Head of Portfolio Operations", "Head of Value Creation"
      ],
      "page": 1,
      "per_page": 10
    });

    const options = {
      hostname: 'api.apollo.io',
      path: '/api/v1/mixed_people/search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': searchData.length,
        'Cache-Control': 'no-cache',
        'X-Api-Key': APOLLO_API_KEY
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(searchData);
    req.end();
  });
}

async function enrichFirms() {
  const enrichments = [];
  
  console.log('Starting Apollo enrichment for 15 PE firms...\n');
  
  for (let i = 0; i < Math.min(15, targets.length); i++) {
    const firm = targets[i];
    console.log(`\n[${i+1}/15] Searching: ${firm['Company Name']}`);
    
    try {
      const result = await searchApollo(firm['Company Name']);
      
      if (result.people && result.people.length > 0) {
        const contact = result.people[0];
        
        // Only use if email is verified
        if (contact.email && contact.email_status === 'verified') {
          enrichments.push({
            row: firm._row,
            company: firm['Company Name'],
            contactName: contact.name || `${contact.first_name} ${contact.last_name}`,
            title: contact.title,
            email: contact.email,
            linkedin: contact.linkedin_url,
            source: 'Apollo API - verified',
            allContacts: result.people.slice(0, 5).map(p => ({
              name: `${p.first_name} ${p.last_name}`,
              title: p.title,
              email: p.email,
              verified: p.email_status === 'verified'
            }))
          });
          
          console.log(`   ✅ Found: ${contact.name} (${contact.title})`);
          console.log(`   ✉ ${contact.email} [${contact.email_status}]`);
        } else {
          console.log(`   ⚠ Found contacts but no verified email`);
        }
      } else {
        console.log(`   ⚠ No contacts found`);
      }
      
      // Rate limit: 1 request per second
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  // Save results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const filename = `apollo-enrichment-${timestamp}.json`;
  fs.writeFileSync(filename, JSON.stringify(enrichments, null, 2));
  
  console.log(`\n\n=== ENRICHMENT COMPLETE ===`);
  console.log(`Found ${enrichments.length} verified contacts`);
  console.log(`Results saved to: ${filename}`);
  
  return enrichments;
}

enrichFirms().catch(console.error);
