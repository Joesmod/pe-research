const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

async function main() {
  console.log('=== PE RESEARCH & ENRICHMENT - HOURLY RUN ===\n');
  console.log(`Time: ${new Date().toISOString()}`);
  
  // Initialize Google Sheets API
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read current sheet data
  console.log('\n1. Reading sheet data...');
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:Z1000',
  });
  
  const [headers, ...rows] = response.data.values;
  console.log(`   Found ${rows.length} rows`);
  
  // Find column indices
  const colIdx = {
    company: headers.indexOf('Company'),
    contact: headers.indexOf('Contact Name'),
    email: headers.indexOf('Email'),
    title: headers.indexOf('Position/Title'),
    linkedin: headers.indexOf('LinkedIn URL'),
    website: headers.indexOf('Website'),
    status: headers.indexOf('Status'),
    notes: headers.indexOf('Notes'),
  };
  
  console.log('\n2. Identifying leads needing enrichment...');
  const needsEnrichment = [];
  
  rows.forEach((row, idx) => {
    const company = row[colIdx.company] || '';
    const contact = row[colIdx.contact] || '';
    const email = row[colIdx.email] || '';
    const website = row[colIdx.website] || '';
    const status = row[colIdx.status] || '';
    
    // Skip if already enriched or dead
    if (status.toLowerCase().includes('enriched') || 
        status.toLowerCase().includes('dead') ||
        status.toLowerCase().includes('sent')) {
      return;
    }
    
    // Need enrichment if:
    // - Missing contact name
    // - Missing or generic email (info@, sales@, ir@, contact@, etc.)
    const hasGenericEmail = email && /^(info|sales|ir|contact|admin|support|hello)@/i.test(email);
    
    if (!contact || !email || hasGenericEmail) {
      needsEnrichment.push({
        rowNum: idx + 2,
        company,
        website,
        contact,
        email,
        reason: !contact ? 'Missing contact' : 
                hasGenericEmail ? `Generic email: ${email}` : 
                'Missing email'
      });
    }
  });
  
  console.log(`   Found ${needsEnrichment.length} leads needing enrichment`);
  
  // Limit to 15 per run
  const toEnrich = needsEnrichment.slice(0, 15);
  console.log(`   Processing ${toEnrich.length} leads this run\n`);
  
  const enriched = [];
  const failed = [];
  
  // Enrich each lead
  for (const lead of toEnrich) {
    console.log(`\n--- Enriching: ${lead.company} ---`);
    console.log(`    Row: ${lead.rowNum}, Reason: ${lead.reason}`);
    
    if (!lead.website) {
      console.log('    ❌ No website - skipping');
      failed.push({ ...lead, error: 'No website' });
      continue;
    }
    
    // Extract domain from website
    let domain = lead.website.replace(/^https?:\/\//i, '').replace(/\/$/, '');
    domain = domain.split('/')[0];
    
    console.log(`    Searching Apollo for: ${domain}`);
    
    try {
      // Apollo People Search API
      const response = await fetch('https://api.apollo.io/v1/mixed_people/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({
          api_key: APOLLO_API_KEY,
          q_organization_domains: [domain],
          person_titles: [
            'CEO', 'CTO', 'COO', 'CMO', 'CFO',
            'Managing Partner', 'Operating Partner', 'General Partner', 'Partner',
            'Managing Director', 'Director', 
            'VP Technology', 'VP Operations', 'VP Digital',
            'Head of Portfolio', 'Head of Value Creation', 'Head of Operations'
          ],
          per_page: 5,
        }),
      });
      
      const data = await response.json();
      
      if (data.people && data.people.length > 0) {
        // Pick the first person with a valid email
        const person = data.people.find(p => p.email && !/@apollo\.io$/.test(p.email));
        
        if (person) {
          console.log(`    ✅ Found: ${person.name} (${person.title})`);
          console.log(`       Email: ${person.email}`);
          
          enriched.push({
            rowNum: lead.rowNum,
            contact: person.name,
            title: person.title || '',
            email: person.email,
            linkedin: person.linkedin_url || '',
            source: `Apollo - ${new Date().toISOString().split('T')[0]}`,
          });
          
          // Rate limit: 1 request per 2 seconds
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          console.log('    ⚠️  Found people but no valid emails');
          failed.push({ ...lead, error: 'No valid emails in Apollo' });
        }
      } else {
        console.log('    ⚠️  No people found in Apollo');
        failed.push({ ...lead, error: 'Not found in Apollo' });
      }
    } catch (error) {
      console.log(`    ❌ Error: ${error.message}`);
      failed.push({ ...lead, error: error.message });
    }
  }
  
  console.log(`\n\n=== ENRICHMENT COMPLETE ===`);
  console.log(`✅ Successfully enriched: ${enriched.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  
  // Update sheet
  if (enriched.length > 0) {
    console.log('\n3. Updating Google Sheet...');
    
    for (const update of enriched) {
      const values = [
        [update.contact, update.title, update.email, update.linkedin, 'Enriched', update.source]
      ];
      
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!B${update.rowNum}:G${update.rowNum}`,
        valueInputOption: 'RAW',
        resource: { values },
      });
      
      console.log(`   Updated row ${update.rowNum}: ${update.contact}`);
    }
  }
  
  // Log results
  const report = {
    timestamp: new Date().toISOString(),
    total_candidates: needsEnrichment.length,
    processed: toEnrich.length,
    enriched: enriched.length,
    failed: failed.length,
    results: enriched,
    failures: failed,
  };
  
  fs.writeFileSync(
    path.join(__dirname, `enrichment-report-${new Date().toISOString().split('T')[0]}-${new Date().getHours()}pm.json`),
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n✅ Done! Report saved.');
}

main().catch(console.error);
