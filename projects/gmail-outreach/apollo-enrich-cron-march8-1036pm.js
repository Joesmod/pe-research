const https = require('https');

const API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Top priority firms from enrichment analysis
const firms = [
  { name: 'Audax Private Equity', domain: 'audaxprivateequity.com' },
  { name: 'GTCR', domain: 'gtcr.com' },
  { name: 'Parthenon Capital Partners', domain: 'parthenoncapital.com' },
  { name: 'Lee Equity Partners', domain: 'leeequity.com' },
  { name: 'Amulet Capital', domain: 'amuletcapital.com' },
  { name: 'Vesey Street Capital Partners', domain: 'vscpllc.com' },
  { name: 'Ampersand Capital Partners', domain: 'ampersandcapital.com' },
  { name: 'Gryphon Investors', domain: 'gryphoninvestors.com' },
  { name: 'HGGC', domain: 'hggc.com' },
  { name: 'Blue Star Innovation Partners', domain: 'bluestarinnovationpartners.com' },
  { name: 'Casa Verde Capital', domain: 'casaverdecapital.com' },
  { name: 'Alvarez & Marsal Capital', domain: 'a-mcapital.com' }
];

async function searchPeople(firmName, domain) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      organization_domains: [domain],
      person_seniorities: ['partner', 'c_suite', 'vp', 'director'],
      person_titles: [
        'Partner',
        'Managing Partner',
        'Managing Director',
        'Senior Managing Director',
        'CEO',
        'Chief Executive Officer',
        'President',
        'COO',
        'Chief Operating Officer',
        'CTO',
        'Chief Technology Officer',
        'VP',
        'Vice President',
        'Director',
        'Head of'
      ],
      per_page: 3
    });

    const options = {
      hostname: 'api.apollo.io',
      port: 443,
      path: '/v1/mixed_people/api_search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'x-api-key': API_KEY
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          // Log response for debugging
          if (result.error || !result.people) {
            console.log('   API Response:', JSON.stringify(result, null, 2));
          }
          resolve(result);
        } catch (e) {
          console.log('   Parse error. Raw response:', body);
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('Apollo PE Enrichment - March 8, 2026 10:36 PM\n');
  console.log('Searching for decision-makers at 12 target firms...\n');
  
  const findings = [];
  
  for (const firm of firms) {
    try {
      console.log(`\n=== ${firm.name} (${firm.domain}) ===`);
      const result = await searchPeople(firm.name, firm.domain);
      
      if (result.people && result.people.length > 0) {
        const contacts = [];
        result.people.forEach((person, idx) => {
          // Debug: show what we got
          console.log(`\n${idx + 1}. ${person.name || 'N/A'}`);
          console.log(`   Title: ${person.title || 'N/A'}`);
          console.log(`   Email: ${person.email || 'MISSING'}`);
          
          // Skip if no direct email (info@, sales@, etc.)
          if (!person.email || person.email.match(/^(info@|sales@|ir@|contact@|hello@)/i)) {
            console.log(`   STATUS: SKIPPED (generic/missing email)`);
            return;
          }
          
          console.log(`\n${idx + 1}. ${person.name || 'N/A'}`);
          console.log(`   Title: ${person.title || 'N/A'}`);
          console.log(`   Email: ${person.email}`);
          console.log(`   LinkedIn: ${person.linkedin_url || 'N/A'}`);
          
          contacts.push({
            name: person.name,
            title: person.title,
            email: person.email,
            linkedin: person.linkedin_url
          });
        });
        
        if (contacts.length > 0) {
          findings.push({
            firm: firm.name,
            domain: firm.domain,
            contacts
          });
        }
      } else {
        console.log('No contacts found');
      }
      
      // Rate limit: wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error searching ${firm.name}:`, error.message);
    }
  }
  
  // Save results
  const fs = require('fs');
  fs.writeFileSync('apollo-enrichment-march8-1036pm.json', JSON.stringify(findings, null, 2));
  
  console.log('\n\n=== SUMMARY ===');
  console.log(`Firms searched: ${firms.length}`);
  console.log(`Firms with contacts found: ${findings.length}`);
  console.log(`Total new contacts: ${findings.reduce((sum, f) => sum + f.contacts.length, 0)}`);
  console.log('\nResults saved to: apollo-enrichment-march8-1036pm.json');
}

main().catch(console.error);
