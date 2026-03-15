const https = require('https');
const fs = require('fs');
const path = require('path');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Load targets
const targetsPath = path.join(__dirname, 'enrich-targets-march7-106am.json');
const targets = JSON.parse(fs.readFileSync(targetsPath, 'utf8'));

console.log(`🫡 Starting Apollo enrichment for ${targets.length} firms...`);

const results = [];
let processed = 0;

function searchPeople(companyName) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      q_organization_name: companyName,
      person_titles: [
        "Partner", "Managing Partner", "General Partner", "Operating Partner",
        "Principal", "Vice President", "VP", "Director", 
        "CEO", "CFO", "COO", "CTO", "CMO",
        "Head of"
      ],
      page: 1,
      per_page: 5
    });

    const options = {
      hostname: 'api.apollo.io',
      path: '/api/v1/mixed_people/api_search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`Apollo API error: ${res.statusCode} - ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function enrichFirm(target) {
  try {
    console.log(`\n🔍 Searching: ${target.company}...`);
    const response = await searchPeople(target.company);
    
    if (!response.people || response.people.length === 0) {
      console.log(`   ❌ No contacts found`);
      results.push({
        row: target.row,
        company: target.company,
        status: 'no_results',
        contacts: []
      });
      return;
    }

    const contacts = response.people
      .filter(p => p.email && !/(info|sales|ir|investor|contact)@/i.test(p.email))
      .slice(0, 3)
      .map(p => ({
        name: p.name,
        title: p.title,
        email: p.email,
        linkedin: p.linkedin_url || ''
      }));

    if (contacts.length > 0) {
      console.log(`   ✅ Found ${contacts.length} contacts:`);
      contacts.forEach(c => console.log(`      - ${c.name}, ${c.title}, ${c.email}`));
    } else {
      console.log(`   ⚠️  Found people but no valid emails`);
    }

    results.push({
      row: target.row,
      company: target.company,
      status: contacts.length > 0 ? 'enriched' : 'no_email',
      contacts
    });

  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    results.push({
      row: target.row,
      company: target.company,
      status: 'error',
      error: error.message,
      contacts: []
    });
  }

  processed++;
}

async function main() {
  // Process first 10 to conserve API credits
  const batch = targets.slice(0, 10);
  
  for (const target of batch) {
    await enrichFirm(target);
    // Rate limit: 1 request per second
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n\n📊 Enrichment Complete:`);
  console.log(`   Processed: ${processed}/${batch.length}`);
  const enrichedCount = results.filter(r => r.status === 'enriched').length;
  console.log(`   Enriched: ${enrichedCount}`);
  console.log(`   No results: ${results.filter(r => r.status === 'no_results').length}`);
  console.log(`   Errors: ${results.filter(r => r.status === 'error').length}`);

  // Save results
  const outputPath = path.join(__dirname, 'apollo-enrichment-march7-106am.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n✅ Results saved to: apollo-enrichment-march7-106am.json`);
  
  // Show enriched contacts
  console.log(`\n\n🎯 Enriched Contacts (ready to update sheet):`);
  results.filter(r => r.status === 'enriched').forEach(r => {
    console.log(`\nRow ${r.row}: ${r.company}`);
    r.contacts.forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.name} | ${c.title} | ${c.email}`);
    });
  });
}

main().catch(e => {
  console.error('Fatal error:', e.message);
  process.exit(1);
});
