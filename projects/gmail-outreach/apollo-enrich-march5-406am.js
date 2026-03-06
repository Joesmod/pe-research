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

// Real PE firms to target (excluding service providers)
const PE_KEYWORDS = ['private equity', 'capital partners', 'equity partners', 'investment partners', 'growth equity'];
const EXCLUDE_KEYWORDS = ['search', 'recruiting', 'recruiting', 'consulting', 'advisory', 'advisor', 'oasis', 'prep', 'wefunder'];

function apolloSearch(companyName) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      api_key: APOLLO_API_KEY,
      q_organization_name: companyName,
      page: 1,
      per_page: 10,
      person_titles: [
        "Managing Partner",
        "Managing Director",
        "General Partner",
        "Partner",
        "Chief Operating Officer",
        "COO",
        "Chief Technology Officer",
        "CTO",
        "VP Technology",
        "VP Operations",
        "VP Portfolio Operations",
        "Director Technology",
        "Director Operations",
        "Head of Technology",
        "Head of Operations"
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
        'Cache-Control': 'no-cache'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve(result);
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

async function main() {
  console.log('=== Apollo Enrichment - March 5, 4:06 AM ===\n');
  
  // Read targets from previous script
  const targetsRaw = fs.readFileSync('enrichment-targets-march5-406am.json', 'utf8');
  const targets = JSON.parse(targetsRaw);
  
  console.log(`Loaded ${targets.length} targets\n`);
  
  // Filter for real PE firms
  const realPETargets = targets.filter(t => {
    const companyLower = t.company.toLowerCase();
    
    // Exclude known non-PE firms
    if (EXCLUDE_KEYWORDS.some(kw => companyLower.includes(kw))) {
      return false;
    }
    
    // Include if contains PE keywords
    return PE_KEYWORDS.some(kw => companyLower.includes(kw)) || 
           companyLower.includes('capital') || 
           companyLower.includes('partners');
  });
  
  console.log(`Filtered to ${realPETargets.length} likely PE firms\n`);
  
  const enrichmentResults = [];
  const updates = [];
  
  // Enrich first 15 firms
  for (let i = 0; i < Math.min(15, realPETargets.length); i++) {
    const target = realPETargets[i];
    console.log(`\n[${i + 1}/${Math.min(15, realPETargets.length)}] Enriching: ${target.company}`);
    
    try {
      const result = await apolloSearch(target.company);
      
      if (result.people && result.people.length > 0) {
        // Prioritize: Partners > C-level > VPs > Directors
        const prioritized = result.people.sort((a, b) => {
          const titleA = (a.title || '').toLowerCase();
          const titleB = (b.title || '').toLowerCase();
          
          if (titleA.includes('partner')) return -1;
          if (titleB.includes('partner')) return 1;
          if (titleA.includes('coo') || titleA.includes('cto')) return -1;
          if (titleB.includes('coo') || titleB.includes('cto')) return 1;
          return 0;
        });
        
        const best = prioritized[0];
        
        if (best.email && !best.email.includes('info@') && !best.email.includes('sales@')) {
          console.log(`✓ Found: ${best.name} - ${best.title}`);
          console.log(`  Email: ${best.email}`);
          console.log(`  LinkedIn: ${best.linkedin_url || 'N/A'}`);
          
          enrichmentResults.push({
            company: target.company,
            rowIndex: target.rowIndex,
            contact: best.name,
            title: best.title,
            email: best.email,
            linkedin: best.linkedin_url || '',
            source: 'Apollo API'
          });
          
          // Prepare sheet update
          updates.push({
            range: `Sheet1!C${target.rowIndex}:G${target.rowIndex}`,
            values: [[
              best.name,
              best.title,
              best.email,
              target.company, // Website (keep existing)
              best.linkedin_url || ''
            ]]
          });
        } else {
          console.log(`✗ No verified email found`);
        }
      } else {
        console.log(`✗ No results from Apollo`);
      }
      
      // Rate limit: 1 request per second
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`✗ Error: ${error.message}`);
    }
  }
  
  console.log(`\n\n=== ENRICHMENT SUMMARY ===`);
  console.log(`Successfully enriched: ${enrichmentResults.length} leads`);
  
  if (enrichmentResults.length > 0) {
    console.log(`\n=== UPDATING GOOGLE SHEET ===`);
    
    for (const update of updates) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: update.range,
        valueInputOption: 'RAW',
        resource: { values: update.values }
      });
      
      console.log(`✓ Updated row ${update.range.match(/\d+/)[0]}`);
    }
    
    console.log(`\n✓ Sheet updated with ${updates.length} enrichments`);
  }
  
  // Save results
  fs.writeFileSync(
    'apollo-enrichment-march5-406am.json',
    JSON.stringify(enrichmentResults, null, 2)
  );
  
  console.log(`\n✓ Saved results to apollo-enrichment-march5-406am.json`);
}

main().catch(console.error);
