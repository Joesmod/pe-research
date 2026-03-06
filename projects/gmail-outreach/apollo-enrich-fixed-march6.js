const https = require('https');
const fs = require('fs');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Read leads needing enrichment
const leadsToEnrich = JSON.parse(fs.readFileSync('leads-to-enrich-336pm.json', 'utf8'));

// Apollo API search function
function searchApollo(companyName, titles) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      q_organization_name: companyName,
      person_titles: titles,
      page: 1,
      per_page: 5
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

// Process leads
async function enrichLeads() {
  const results = [];
  const batch = leadsToEnrich.slice(0, 15); // First 15 leads
  
  console.log(`\n=== ENRICHING ${batch.length} LEADS ===\n`);
  
  for (const lead of batch) {
    console.log(`\nSearching: ${lead.company}`);
    
    // Cast wide net for decision-makers
    const titles = [
      'CEO', 'CTO', 'COO', 'CMO', 'CFO',
      'Managing Partner', 'General Partner', 'Operating Partner',
      'Director', 'Vice President', 'VP',
      'Head of', 'Chief'
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
          source: `API Error: ${response.error}`,
          status: 'Error'
        });
        continue;
      }
      
      if (response.people && response.people.length > 0) {
        // Take the first match with an email
        const contact = response.people.find(p => p.email);
        
        if (contact) {
          console.log(`  ✓ Found: ${contact.name} - ${contact.title}`);
          console.log(`    Email: ${contact.email}`);
          console.log(`    LinkedIn: ${contact.linkedin_url || 'N/A'}`);
          
          results.push({
            rowIndex: lead.rowIndex,
            company: lead.company,
            contactName: contact.name,
            title: contact.title,
            email: contact.email,
            linkedIn: contact.linkedin_url || '',
            source: 'Apollo API',
            status: 'Enriched'
          });
        } else {
          console.log(`  ✗ No email found`);
          results.push({
            rowIndex: lead.rowIndex,
            company: lead.company,
            contactName: '',
            title: '',
            email: '',
            linkedIn: '',
            source: 'Apollo - no email',
            status: 'Partial'
          });
        }
      } else {
        console.log(`  ✗ No contacts found`);
        results.push({
          rowIndex: lead.rowIndex,
          company: lead.company,
          contactName: '',
          title: '',
          email: '',
          linkedIn: '',
          source: 'Apollo - no results',
          status: 'Partial'
        });
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1500));
      
    } catch (error) {
      console.error(`  Error: ${error.message}`);
      results.push({
        rowIndex: lead.rowIndex,
        company: lead.company,
        contactName: '',
        title: '',
        email: '',
        linkedIn: '',
        source: `Error: ${error.message}`,
        status: 'Error'
      });
    }
  }
  
  // Save results
  fs.writeFileSync('apollo-enrichment-march6-336pm-fixed.json', JSON.stringify(results, null, 2));
  console.log(`\n\n=== ENRICHMENT COMPLETE ===`);
  console.log(`Total processed: ${results.length}`);
  console.log(`Successfully enriched: ${results.filter(r => r.email).length}`);
  console.log(`Results saved to: apollo-enrichment-march6-336pm-fixed.json`);
  
  return results;
}

// Run enrichment
enrichLeads().catch(console.error);
