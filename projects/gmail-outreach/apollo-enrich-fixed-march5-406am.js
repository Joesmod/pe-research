const https = require('https');
const fs = require('fs');
const { google } = require('googleapis');
const key = require('./service-account.json');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const jwtClient = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  ['https://www.googleapis.com/auth/spreadsheets']
);

const sheets = google.sheets({ version: 'v4', auth: jwtClient });

function apolloOrgSearch(companyName) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      q_organization_name: companyName,
      page: 1,
      per_page: 1
    });

    const options = {
      hostname: 'api.apollo.io',
      port: 443,
      path: '/v1/organizations/search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'X-Api-Key': APOLLO_API_KEY
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

function apolloPeopleSearch(companyDomain) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      q_organization_domains: [companyDomain],
      page: 1,
      per_page: 10,
      person_titles: [
        "Managing Partner",
        "Managing Director",
        "General Partner",
        "Partner",
        "COO",
        "CTO",
        "VP Technology",
        "VP Operations",
        "Director Technology",
        "Head of Technology"
      ]
    });

    const options = {
      hostname: 'api.apollo.io',
      port: 443,
      path: '/v1/mixed_people/search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'X-Api-Key': APOLLO_API_KEY
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

// Real PE keywords
const PE_KEYWORDS = ['private equity', 'capital partners', 'equity partners', 'investment partners', 'growth equity'];
const EXCLUDE_KEYWORDS = ['search', 'recruiting', 'consulting', 'advisory', 'advisor', 'oasis', 'prep', 'wefunder', 'wall street'];

async function main() {
  console.log('=== Apollo Enrichment - March 5, 4:06 AM (FIXED) ===\n');
  
  // Read targets
  const targetsRaw = fs.readFileSync('enrichment-targets-march5-406am.json', 'utf8');
  const targets = JSON.parse(targetsRaw);
  
  console.log(`Loaded ${targets.length} targets\n`);
  
  // Filter for real PE firms
  const realPETargets = targets.filter(t => {
    const companyLower = t.company.toLowerCase();
    
    if (EXCLUDE_KEYWORDS.some(kw => companyLower.includes(kw))) {
      return false;
    }
    
    return PE_KEYWORDS.some(kw => companyLower.includes(kw)) || 
           companyLower.includes('capital') || 
           companyLower.includes('partners');
  });
  
  console.log(`Filtered to ${realPETargets.length} likely PE firms\n`);
  
  const enrichmentResults = [];
  const updates = [];
  
  // Enrich first 15
  for (let i = 0; i < Math.min(15, realPETargets.length); i++) {
    const target = realPETargets[i];
    console.log(`\n[${i + 1}/${Math.min(15, realPETargets.length)}] ${target.company}`);
    
    try {
      // Step 1: Find organization
      const orgResult = await apolloOrgSearch(target.company);
      
      if (orgResult.error) {
        console.log(`✗ API Error: ${orgResult.error}`);
        continue;
      }
      
      if (orgResult.organizations && orgResult.organizations.length > 0) {
        const org = orgResult.organizations[0];
        console.log(`  Found org: ${org.name}`);
        console.log(`  Domain: ${org.primary_domain}`);
        
        // Step 2: Find people
        if (org.primary_domain) {
          await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit
          
          const peopleResult = await apolloPeopleSearch(org.primary_domain);
          
          if (peopleResult.people && peopleResult.people.length > 0) {
            // Prioritize by title
            const prioritized = peopleResult.people.sort((a, b) => {
              const titleA = (a.title || '').toLowerCase();
              const titleB = (b.title || '').toLowerCase();
              
              if (titleA.includes('partner')) return -1;
              if (titleB.includes('partner')) return 1;
              if (titleA.includes('coo') || titleA.includes('cto')) return -1;
              if (titleB.includes('coo') || titleB.includes('cto')) return 1;
              return 0;
            });
            
            const best = prioritized[0];
            
            if (best.email && 
                !best.email.includes('info@') && 
                !best.email.includes('sales@') &&
                !best.email.includes('ir@')) {
              
              console.log(`  ✓ ${best.name} - ${best.title}`);
              console.log(`    Email: ${best.email}`);
              
              enrichmentResults.push({
                company: target.company,
                rowIndex: target.rowIndex,
                contact: best.name,
                title: best.title,
                email: best.email,
                linkedin: best.linkedin_url || '',
                source: 'Apollo API'
              });
              
              updates.push({
                range: `Sheet1!C${target.rowIndex}:E${target.rowIndex}`,
                values: [[best.name, best.title, best.email]]
              });
              
              if (best.linkedin_url) {
                updates.push({
                  range: `Sheet1!G${target.rowIndex}`,
                  values: [[best.linkedin_url]]
                });
              }
            } else {
              console.log(`  ✗ No verified email`);
            }
          } else {
            console.log(`  ✗ No people found`);
          }
        }
      } else {
        console.log(`  ✗ Organization not found`);
      }
      
      // Rate limit: 1 request per second
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`  ✗ Error: ${error.message}`);
    }
  }
  
  console.log(`\n\n=== ENRICHMENT SUMMARY ===`);
  console.log(`Successfully enriched: ${enrichmentResults.length}/${Math.min(15, realPETargets.length)} leads`);
  
  if (enrichmentResults.length > 0) {
    console.log(`\n=== UPDATING GOOGLE SHEET ===`);
    
    for (const update of updates) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: update.range,
        valueInputOption: 'RAW',
        resource: { values: update.values }
      });
      
      const rowNum = update.range.match(/\d+/)[0];
      console.log(`✓ Updated row ${rowNum}`);
    }
    
    console.log(`\n✓ Sheet updated!`);
  }
  
  // Save results
  fs.writeFileSync(
    'apollo-enrichment-march5-406am-FINAL.json',
    JSON.stringify(enrichmentResults, null, 2)
  );
  
  console.log(`\n✓ Results saved to apollo-enrichment-march5-406am-FINAL.json`);
  
  // Print summary
  console.log(`\n=== ENRICHED CONTACTS ===`);
  enrichmentResults.forEach((r, idx) => {
    console.log(`\n${idx + 1}. ${r.company}`);
    console.log(`   ${r.contact} - ${r.title}`);
    console.log(`   ${r.email}`);
  });
}

main().catch(console.error);
