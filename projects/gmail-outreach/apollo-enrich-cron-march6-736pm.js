const https = require('https');
const fs = require('fs');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Read leads needing enrichment from our analysis
const allLeads = JSON.parse(fs.readFileSync('leads-needing-enrichment-cron.json', 'utf8'));

// Take first 15 leads
const leadsToEnrich = allLeads.slice(0, 15).map((row, idx) => ({
  rowIndex: idx + 2,  // +2 because of header row and 0-indexing
  company: row[0] || 'Unknown',
  currentContact: row[2] || '',
  currentEmail: row[4] || '',
  website: row[5] || '',
  status: row[9] || ''
}));

// Apollo API search function
function searchApollo(companyName, titles) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      q_organization_name: companyName,
      person_titles: titles,
      page: 1,
      per_page: 10
    });

    const options = {
      hostname: 'api.apollo.io',
      path: '/v1/mixed_people/api_search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'X-Api-Key': APOLLO_API_KEY,
        'Cache-Control': 'no-cache'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
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

// Wait between requests
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Process leads
async function enrichLeads() {
  const results = [];
  
  console.log(`\n=== ENRICHING ${leadsToEnrich.length} LEADS ===\n`);
  console.log(`Start time: ${new Date().toLocaleString()}\n`);
  
  for (const lead of leadsToEnrich) {
    console.log(`\nSearching: ${lead.company}`);
    
    // Cast wide net for decision-makers - PRIORITY ORDER
    const titles = [
      // C-Suite
      'CEO', 'Chief Executive Officer',
      'CTO', 'Chief Technology Officer', 
      'COO', 'Chief Operating Officer',
      'CMO', 'Chief Marketing Officer',
      'CFO', 'Chief Financial Officer',
      // Partners
      'Managing Partner', 'General Partner', 'Operating Partner', 'Partner',
      // Directors & VPs
      'Director of Technology', 'Director of Product', 'Director of Operations',
      'Vice President', 'VP Technology', 'VP Operations', 'VP Digital',
      // Heads of
      'Head of Value Creation', 'Head of Portfolio Operations', 'Head of Business Development'
    ];
    
    try {
      const response = await searchApollo(lead.company, titles);
      
      if (response.error) {
        console.log(`  Error: ${response.error}`);
        results.push({
          rowIndex: lead.rowIndex,
          company: lead.company,
          contactName: '',
          title: '',
          email: '',
          linkedIn: '',
          source: `Apollo API Error: ${response.error}`,
          status: 'Error'
        });
      } else if (response.people && response.people.length > 0) {
        // Take the first result (highest ranking match)
        const person = response.people[0];
        const email = person.email || '';
        const linkedIn = person.linkedin_url || '';
        
        console.log(`  ✓ Found: ${person.name} - ${person.title || 'No title'}`);
        console.log(`    Email: ${email || 'None'}`);
        console.log(`    LinkedIn: ${linkedIn || 'None'}`);
        
        results.push({
          rowIndex: lead.rowIndex,
          company: lead.company,
          contactName: person.name || '',
          title: person.title || '',
          email: email,
          linkedIn: linkedIn,
          source: 'Apollo API',
          status: email ? 'Enriched' : 'Partial - LinkedIn Only'
        });
      } else {
        console.log(`  ✗ No results found`);
        results.push({
          rowIndex: lead.rowIndex,
          company: lead.company,
          contactName: lead.currentContact,
          title: '',
          email: lead.currentEmail,
          linkedIn: '',
          source: 'Apollo API - No matches found',
          status: 'Needs Manual Research'
        });
      }
      
      // Rate limiting - wait 1 second between requests
      await delay(1000);
      
    } catch (error) {
      console.log(`  Error: ${error.message}`);
      results.push({
        rowIndex: lead.rowIndex,
        company: lead.company,
        contactName: '',
        title: '',
        email: '',
        linkedIn: '',
        source: `Exception: ${error.message}`,
        status: 'Error'
      });
    }
  }
  
  console.log(`\n\n=== ENRICHMENT COMPLETE ===\n`);
  console.log(`End time: ${new Date().toLocaleString()}`);
  console.log(`Total processed: ${results.length}`);
  console.log(`Enriched: ${results.filter(r => r.status === 'Enriched').length}`);
  console.log(`Partial: ${results.filter(r => r.status === 'Partial - LinkedIn Only').length}`);
  console.log(`Errors: ${results.filter(r => r.status === 'Error').length}`);
  console.log(`Manual needed: ${results.filter(r => r.status === 'Needs Manual Research').length}\n`);
  
  fs.writeFileSync('apollo-enrichment-cron-736pm.json', JSON.stringify(results, null, 2));
  console.log('Results saved to: apollo-enrichment-cron-736pm.json\n');
  
  return results;
}

// Run enrichment
enrichLeads()
  .then(results => {
    console.log('✓ Enrichment batch complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('✗ Enrichment failed:', error);
    process.exit(1);
  });
