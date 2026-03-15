const { google } = require('googleapis');
const fs = require('fs');
const https = require('https');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = JSON.parse(fs.readFileSync('service-account.json'));
const APOLLO_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

const targets = JSON.parse(fs.readFileSync('enrichment-targets-march7-1136am.json'));

function apolloSearch(organizationName, domain) {
  return new Promise((resolve, reject) => {
    const searchBody = JSON.stringify({
      api_key: APOLLO_KEY,
      q_organization_name: organizationName,
      q_organization_domains: domain ? [domain] : undefined,
      person_titles: [
        "CEO", "Chief Executive Officer",
        "Managing Partner", "Managing Director",
        "Partner", "General Partner",
        "COO", "Chief Operating Officer",
        "CTO", "Chief Technology Officer",
        "VP Technology", "VP Operations",
        "Director Technology", "Director Operations"
      ],
      page: 1,
      per_page: 10
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
  
  // Extract domain from website
  let domain = '';
  if (target.website) {
    try {
      const url = target.website.startsWith('http') ? 
        new URL(target.website) : 
        new URL('http://' + target.website);
      domain = url.hostname.replace('www.', '');
    } catch (e) {
      console.log('  ⚠️  Could not parse website URL');
    }
  }
  
  console.log(`  Domain: ${domain || 'none'}`);
  
  try {
    const result = await apolloSearch(target.company, domain);
    
    if (result.people && result.people.length > 0) {
      const person = result.people[0]; // Take first match
      
      const enriched = {
        rowNum: target.rowNum,
        company: target.company,
        contactName: person.name || '',
        title: person.title || '',
        email: person.email || '',
        linkedin: person.linkedin_url || '',
        source: 'Apollo API'
      };
      
      console.log(`  ✅ Found: ${enriched.contactName}`);
      console.log(`     Title: ${enriched.title}`);
      console.log(`     Email: ${enriched.email || '(no email)'}`);
      
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
  
  console.log(`\n🚀 Starting Apollo enrichment for ${Math.min(10, targets.length)} targets...\n`);
  
  for (let i = 0; i < Math.min(10, targets.length); i++) {
    const result = await enrichOne(targets[i]);
    if (result) {
      results.push(result);
    }
    // Rate limit: 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
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
    console.log('\nNext step: Run update script to write to sheet');
  }
}

enrichBatch().catch(console.error);
