const https = require('https');
const fs = require('fs');

const API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Priority firms needing enrichment (from sheet analysis)
const firms = [
  { name: 'Thomas H. Lee Partners', domain: 'thl.com' },
  { name: 'Argonaut Private Equity', domain: 'argonautpe.com' },
  { name: 'Pritzker Group Private Capital', domain: 'ppcpartners.com' },
  { name: 'Frontenac Company', domain: 'frontenac.com' },
  { name: 'Calvert Street Capital Partners', domain: 'calvertstreet.com' },
  { name: 'Caprae Capital Partners', domain: 'capraecapital.com' },
  { name: 'Infinity Capital Partners', domain: 'infinitycapitalpartners.com' },
  { name: 'Cambridge Capital LLC', domain: 'cambridgecapital.com' },
  { name: 'Lux Capital', domain: 'luxcapital.com' },
  { name: 'Palm Beach Capital', domain: 'palmbeachcap.com' }
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
        'VP Operations',
        'Vice President Operations',
        'VP Technology',
        'Vice President Technology',
        'Director Operations',
        'Director Technology',
        'Director Digital',
        'Head of Operations',
        'Head of Technology',
        'Head of Digital'
      ],
      per_page: 5
    });

    const options = {
      hostname: 'api.apollo.io',
      port: 443,
      path: '/v1/mixed_people/search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': API_KEY
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve(result);
        } catch (e) {
          console.log('   Parse error. Raw response:', body.substring(0, 500));
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
  console.log('🔍 Apollo PE Enrichment - March 9, 2026 12:36 AM\n');
  console.log(`Searching for decision-makers at ${firms.length} target firms...\n`);
  
  const findings = [];
  const errors = [];
  
  for (const firm of firms) {
    try {
      console.log(`\n=== ${firm.name} (${firm.domain}) ===`);
      const result = await searchPeople(firm.name, firm.domain);
      
      if (result.error) {
        console.log(`   ❌ API Error: ${result.error}`);
        errors.push({ firm: firm.name, error: result.error });
        continue;
      }
      
      if (!result.people || result.people.length === 0) {
        console.log('   ⚠️  No contacts found');
        continue;
      }
      
      console.log(`   ✅ Found ${result.people.length} contacts`);
      
      result.people.forEach((person, idx) => {
        const email = person.email || person.corporate_email || 'NO EMAIL';
        const emailStatus = person.email_status || 'unknown';
        
        console.log(`\n   ${idx + 1}. ${person.name || 'N/A'}`);
        console.log(`      Title: ${person.title || 'N/A'}`);
        console.log(`      Email: ${email}`);
        console.log(`      Status: ${emailStatus}`);
        console.log(`      LinkedIn: ${person.linkedin_url || 'N/A'}`);
        
        // Only save contacts with verified or likely emails
        if (email !== 'NO EMAIL' && ['verified', 'likely', 'guessed'].includes(emailStatus)) {
          findings.push({
            firm: firm.name,
            domain: firm.domain,
            contact: person.name,
            title: person.title,
            email: email,
            emailStatus: emailStatus,
            linkedin: person.linkedin_url || '',
            source: 'Apollo.io'
          });
        }
      });
      
      // Rate limiting - wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      errors.push({ firm: firm.name, error: error.message });
    }
  }
  
  // Save results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const findingsFile = `apollo-findings-march9-0036am.json`;
  
  fs.writeFileSync(findingsFile, JSON.stringify(findings, null, 2));
  
  console.log(`\n\n📊 ENRICHMENT SUMMARY`);
  console.log(`=====================================`);
  console.log(`Firms searched: ${firms.length}`);
  console.log(`Contacts found: ${findings.length}`);
  console.log(`Errors: ${errors.length}`);
  console.log(`\nSaved to: ${findingsFile}`);
  
  if (findings.length > 0) {
    console.log(`\n✅ SUCCESS - Ready to update Google Sheet`);
    console.log(`\nTop contacts:`);
    findings.slice(0, 5).forEach((f, idx) => {
      console.log(`\n${idx + 1}. ${f.firm}`);
      console.log(`   ${f.contact} - ${f.title}`);
      console.log(`   ${f.email} (${f.emailStatus})`);
    });
  }
  
  if (errors.length > 0) {
    console.log(`\n⚠️  ERRORS:`);
    errors.forEach(e => {
      console.log(`   - ${e.firm}: ${e.error}`);
    });
  }
  
  console.log(`\n✅ Enrichment complete at ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}\n`);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
