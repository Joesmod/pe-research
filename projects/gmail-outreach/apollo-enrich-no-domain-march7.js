const { google } = require('googleapis');
const fs = require('fs');
const https = require('https');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = JSON.parse(fs.readFileSync('service-account.json'));
const APOLLO_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

const targets = JSON.parse(fs.readFileSync('enrichment-targets-march7-1136am.json'));

function apolloSearch(organizationName) {
  return new Promise((resolve, reject) => {
    const searchBody = JSON.stringify({
      api_key: APOLLO_KEY,
      q_organization_name: organizationName,
      person_titles: [
        "CEO", "Chief Executive Officer",
        "Managing Partner", "Managing Director",
        "Partner", "General Partner",
        "COO", "Chief Operating Officer",
        "CTO", "Chief Technology Officer",
        "President",
        "VP Technology", "VP Operations", "VP Digital",
        "Director Technology", "Director Operations", "Director Digital",
        "Head of Technology", "Head of Operations"
      ],
      page: 1,
      per_page: 15
    });

    const options = {
      hostname: 'api.apollo.io',
      path: '/v1/mixed_people/search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(searchBody)
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
    req.write(searchBody);
    req.end();
  });
}

async function enrichOne(target) {
  console.log(`\n🔍 Enriching: ${target.company}`);
  
  try {
    const result = await apolloSearch(target.company);
    
    if (result.people && result.people.length > 0) {
      // Filter to people who actually work at this org
      const validPeople = result.people.filter(p => 
        p.organization_name && 
        p.organization_name.toLowerCase().includes(target.company.toLowerCase().split(' ').slice(0, 2).join(' '))
      );
      
      if (validPeople.length === 0) {
        console.log(`  ❌ No matches at ${target.company}`);
        return null;
      }
      
      const person = validPeople[0]; // Take first match at correct org
      
      const enriched = {
        rowNum: target.rowNum,
        company: target.company,
        contactName: person.name || '',
        title: person.title || '',
        email: person.email || '',
        linkedin: person.linkedin_url || '',
        source: 'Apollo API - no domain filter'
      };
      
      console.log(`  ✅ Found: ${enriched.contactName}`);
      console.log(`     Title: ${enriched.title}`);
      console.log(`     Email: ${enriched.email || '(no email)'}`);
      console.log(`     Org: ${person.organization_name}`);
      
      return enriched;
    } else {
      console.log(`  ❌ No results from Apollo`);
      return null;
    }
  } catch (error) {
    console.log(`  ❌ Apollo error: ${error.message}`);
    return null;
  }
}

async function enrichBatch() {
  const results = [];
  
  console.log(`\n🚀 Starting Apollo enrichment (no domain filter) for ${Math.min(10, targets.length)} targets...\n`);
  
  for (let i = 0; i < Math.min(10, targets.length); i++) {
    const result = await enrichOne(targets[i]);
    if (result) {
      results.push(result);
    }
    // Rate limit: 1.5 seconds between requests
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  console.log(`\n\n📊 ENRICHMENT RESULTS:`);
  console.log(`Attempted: ${Math.min(10, targets.length)}`);
  console.log(`Successful: ${results.length}`);
  console.log(`Failed: ${Math.min(10, targets.length) - results.length}`);
  
  if (results.length > 0) {
    fs.writeFileSync(
      'apollo-enriched-march7-1136am.json',
      JSON.stringify(results, null, 2)
    );
    console.log(`\n✅ Saved ${results.length} enriched contacts to apollo-enriched-march7-1136am.json`);
  }
  
  return results;
}

enrichBatch().catch(console.error);
