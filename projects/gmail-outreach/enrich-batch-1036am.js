const {google} = require('googleapis');
const fs = require('fs');
const key = require('./service-account.json');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

const auth = new google.auth.GoogleAuth({
  credentials: key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

async function searchApollo(company, domain) {
  const titles = [
    'Managing Partner', 'Partner', 'Managing Director',
    'CEO', 'President', 'COO', 'CTO', 'CFO',
    'VP Technology', 'VP Operations', 'VP Digital',
    'Director Technology', 'Director Operations', 'Director Digital'
  ];
  
  try {
    const response = await fetch('https://api.apollo.io/v1/mixed_people/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': APOLLO_API_KEY
      },
      body: JSON.stringify({
        q_organization_name: company,
        person_titles: titles,
        page: 1,
        per_page: 5
      })
    });
    
    if (!response.ok) {
      console.error(`Apollo API error for ${company}: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data.people && data.people.length > 0) {
      // Return the first result with a valid email
      for (const person of data.people) {
        if (person.email && !person.email.includes('info@') && !person.email.includes('sales@')) {
          return {
            name: person.name,
            title: person.title,
            email: person.email,
            linkedin: person.linkedin_url,
            source: 'Apollo API'
          };
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error searching Apollo for ${company}:`, error.message);
    return null;
  }
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  const targets = JSON.parse(fs.readFileSync('active-enrichment-targets-1036am.json', 'utf8'));
  const enrichmentLog = [];
  
  console.error(`Starting enrichment for ${Math.min(15, targets.length)} firms...`);
  
  for (let i = 0; i < Math.min(15, targets.length); i++) {
    const target = targets[i];
    console.error(`\n[${i+1}/15] Enriching: ${target.company}`);
    
    // Extract domain from website
    let domain = '';
    if (target.website) {
      try {
        const url = new URL(target.website);
        domain = url.hostname.replace('www.', '');
      } catch (e) {}
    }
    
    const result = await searchApollo(target.company, domain);
    
    if (result) {
      console.error(`  ✓ Found: ${result.name} - ${result.title}`);
      console.error(`  Email: ${result.email}`);
      
      enrichmentLog.push({
        rowIndex: target.rowIndex,
        company: target.company,
        found: true,
        ...result
      });
    } else {
      console.error(`  ✗ No direct contact found`);
      enrichmentLog.push({
        rowIndex: target.rowIndex,
        company: target.company,
        found: false,
        reason: 'No results from Apollo'
      });
    }
    
    // Rate limit: wait 1 second between requests
    if (i < Math.min(15, targets.length) - 1) {
      await delay(1000);
    }
  }
  
  fs.writeFileSync('enrichment-results-1036am.json', JSON.stringify(enrichmentLog, null, 2));
  
  const foundCount = enrichmentLog.filter(e => e.found).length;
  console.error(`\n\n=== ENRICHMENT COMPLETE ===`);
  console.error(`Successfully enriched: ${foundCount}/${enrichmentLog.length}`);
  console.error(`Results saved to: enrichment-results-1036am.json`);
  
  console.log(JSON.stringify(enrichmentLog, null, 2));
})();
