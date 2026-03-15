// PE Lead Enrichment - Cron Job March 13, 4:37 AM
const { google } = require('googleapis');
const https = require('https');
const fs = require('fs');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Apollo People Search
async function searchPeopleApollo(companyName, titles = null) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      q_organization_name: companyName,
      person_titles: titles || ['CEO', 'CTO', 'COO', 'CFO', 'CMO', 'Managing Partner', 'Partner', 
                                 'General Partner', 'Operating Partner', 'Principal', 'Director', 
                                 'VP', 'Vice President', 'Head of', 'Chief'],
      page: 1,
      per_page: 10
    });
    
    const options = {
      hostname: 'api.apollo.io',
      port: 443,
      path: '/v1/mixed_people/api_search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length,
        'X-Api-Key': APOLLO_API_KEY,
        'Cache-Control': 'no-cache'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('🔬 PE Research & Enrichment - Hourly Cron');
  console.log('Starting: March 13, 2026 - 4:37 AM CST\n');
  
  // Load targets
  const targets = JSON.parse(fs.readFileSync('enrichment-targets-march11-6pm.json', 'utf8'));
  console.log(`📋 Loaded ${targets.length} targets needing enrichment\n`);
  
  // Initialize Google Sheets
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  const enrichments = [];
  const failures = [];
  
  for (const target of targets) {
    console.log(`\n=== Row ${target.rowNum}: ${target.company} ===`);
    console.log(`Issue: ${target.issue}`);
    console.log(`Current: ${target.contact || 'NONE'} - ${target.email || 'NONE'}`);
    
    try {
      // Search Apollo
      const result = await searchPeopleApollo(target.company);
      
      if (result.error) {
        console.log(`❌ Apollo Error: ${result.error}`);
        failures.push({ ...target, reason: result.error });
        continue;
      }
      
      if (!result.people || result.people.length === 0) {
        console.log(`❌ No contacts found`);
        failures.push({ ...target, reason: 'No contacts found' });
        continue;
      }
      
      // Find best contact with direct email
      let bestContact = null;
      
      for (const person of result.people) {
        const email = person.email;
        const name = person.name || `${person.first_name || ''} ${person.last_name || ''}`.trim();
        const title = person.title || '';
        
        // Skip generic emails
        if (!email || email.includes('info@') || email.includes('sales@') || 
            email.includes('ir@') || email.includes('contact@')) {
          continue;
        }
        
        // Prioritize C-level, Partners, Directors
        const titleLower = title.toLowerCase();
        const isPriority = titleLower.includes('ceo') || titleLower.includes('cto') ||
                          titleLower.includes('managing') || titleLower.includes('partner') ||
                          titleLower.includes('director') || titleLower.includes('vp') ||
                          titleLower.includes('vice president') || titleLower.includes('head of');
        
        if (isPriority && email) {
          bestContact = {
            name,
            title,
            email,
            linkedin: person.linkedin_url || '',
            source: 'Apollo.io verified'
          };
          break; // Found priority contact, use it
        } else if (email && !bestContact) {
          // Fallback: any contact with real email
          bestContact = {
            name,
            title,
            email,
            linkedin: person.linkedin_url || '',
            source: 'Apollo.io verified'
          };
        }
      }
      
      if (!bestContact) {
        console.log(`❌ No verified email found`);
        failures.push({ ...target, reason: 'No verified email' });
        continue;
      }
      
      console.log(`✅ Found: ${bestContact.name}`);
      console.log(`   Title: ${bestContact.title}`);
      console.log(`   Email: ${bestContact.email}`);
      console.log(`   LinkedIn: ${bestContact.linkedin}`);
      
      enrichments.push({
        rowNum: target.rowNum,
        company: target.company,
        ...bestContact
      });
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      failures.push({ ...target, reason: error.message });
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  console.log(`\n\n📊 ENRICHMENT SUMMARY`);
  console.log(`✅ Enriched: ${enrichments.length}`);
  console.log(`❌ Failed: ${failures.length}`);
  
  // Update Google Sheet
  if (enrichments.length > 0) {
    console.log(`\n📝 Updating Google Sheet...`);
    
    const updates = [];
    
    for (const enrich of enrichments) {
      const row = enrich.rowNum;
      
      // Column C: Contact Name
      updates.push({
        range: `Sheet1!C${row}`,
        values: [[enrich.name]]
      });
      
      // Column D: Title
      updates.push({
        range: `Sheet1!D${row}`,
        values: [[enrich.title]]
      });
      
      // Column E: Email
      updates.push({
        range: `Sheet1!E${row}`,
        values: [[enrich.email]]
      });
      
      // Column G: LinkedIn
      if (enrich.linkedin) {
        updates.push({
          range: `Sheet1!G${row}`,
          values: [[enrich.linkedin]]
        });
      }
      
      // Column I: Notes
      updates.push({
        range: `Sheet1!I${row}`,
        values: [[`Enriched via Apollo.io - ${new Date().toISOString().split('T')[0]}`]]
      });
      
      // Column J: Status -> "Enriched"
      updates.push({
        range: `Sheet1!J${row}`,
        values: [['Enriched']]
      });
    }
    
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      resource: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
    
    console.log(`✅ Updated ${enrichments.length} rows in sheet`);
  }
  
  // Save results
  const results = {
    timestamp: new Date().toISOString(),
    enriched: enrichments.length,
    failed: failures.length,
    details: {
      successes: enrichments,
      failures: failures
    }
  };
  
  fs.writeFileSync(
    'enrichment-results-march13-437am.json',
    JSON.stringify(results, null, 2)
  );
  
  console.log(`\n✅ Results saved to enrichment-results-march13-437am.json`);
  console.log(`\n🫡 Enrichment complete!`);
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
