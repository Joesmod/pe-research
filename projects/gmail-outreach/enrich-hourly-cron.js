const fs = require('fs');
const https = require('https');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Read enrichment targets
const targets = JSON.parse(fs.readFileSync('enrichment-targets-clean.json', 'utf-8'));

console.log(`Enriching ${targets.length} leads via Apollo People Search API...\n`);

const results = [];

async function searchPerson(company, contactName, website) {
  return new Promise((resolve, reject) => {
    const domain = website ? new URL(website).hostname.replace('www.', '') : '';
    
    const searchData = {
      api_key: APOLLO_API_KEY,
      q_person_name: contactName,
      organization_domains: domain ? [domain] : [],
      page: 1,
      per_page: 5
    };

    const postData = JSON.stringify(searchData);
    
    const options = {
      hostname: 'api.apollo.io',
      port: 443,
      path: '/v1/mixed_people/search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Cache-Control': 'no-cache'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (e) => { reject(e); });
    req.write(postData);
    req.end();
  });
}

async function enrichAll() {
  for (const target of targets) {
    console.log(`\n🔍 Searching: ${target.ContactName} at ${target.Company}`);
    
    try {
      const searchResult = await searchPerson(target.Company, target.ContactName, target.Website);
      
      if (searchResult.people && searchResult.people.length > 0) {
        const person = searchResult.people[0];
        const email = person.email || person.organization_email || '';
        const title = person.title || '';
        const linkedin = person.linkedin_url || '';
        
        console.log(`✅ Found: ${person.name}`);
        console.log(`   Title: ${title}`);
        console.log(`   Email: ${email || '(not found)'}`);
        console.log(`   LinkedIn: ${linkedin || '(not found)'}`);
        
        results.push({
          company: target.Company,
          contactName: person.name,
          title: title,
          email: email,
          linkedin: linkedin,
          website: target.Website,
          source: 'Apollo People Search',
          foundAt: new Date().toISOString()
        });
      } else {
        console.log(`❌ No results found`);
        results.push({
          company: target.Company,
          contactName: target.ContactName,
          title: '',
          email: '',
          linkedin: '',
          website: target.Website,
          source: 'Apollo - No match',
          foundAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      results.push({
        company: target.Company,
        contactName: target.ContactName,
        error: error.message,
        foundAt: new Date().toISOString()
      });
    }
    
    // Rate limiting: wait 2 seconds between requests
    if (targets.indexOf(target) < targets.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Save results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `enrichment-results-${timestamp}.json`;
  fs.writeFileSync(filename, JSON.stringify(results, null, 2));
  
  console.log(`\n\n📊 ENRICHMENT SUMMARY`);
  console.log(`====================`);
  console.log(`Total processed: ${results.length}`);
  console.log(`Emails found: ${results.filter(r => r.email && r.email.length > 0).length}`);
  console.log(`No matches: ${results.filter(r => !r.email || r.email.length === 0).length}`);
  console.log(`\nResults saved to: ${filename}`);
  
  return results;
}

enrichAll().catch(console.error);
