const { google } = require('googleapis');
const path = require('path');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

const NEW_FIRMS = [
  {
    name: 'HGGC',
    website: 'https://www.hggc.com',
    sector: 'Business Services, Technology, Healthcare Services',
    notes: '~$7B AUM, mid-market PE firm'
  },
  {
    name: 'Svoboda Capital',
    website: 'https://svoco.com',
    sector: 'Business Services, Professional Services, Transportation & Logistics',
    notes: 'Chicago-based, middle market growth companies'
  },
  {
    name: 'WILsquare Capital',
    website: 'https://www.wilsquare.com',
    sector: 'Business Services, Niche Manufacturing, Distribution',
    notes: 'St. Louis-based, lower-middle market, Midwest/Southern U.S. focus'
  },
  {
    name: 'Abry Partners',
    website: 'https://abry.com',
    sector: 'Communications, Media, Information, Business Services',
    notes: 'Middle market, experienced firm'
  },
];

async function enrichAndAdd() {
  console.log('=== ADDING NEW PE FIRMS ===\n');
  console.log(`Time: ${new Date().toISOString()}\n`);
  
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Find the next empty row
  console.log('1. Finding next empty row...');
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:A1000',
  });
  
  const nextRow = response.data.values ? response.data.values.length + 1 : 2;
  console.log(`   Next available row: ${nextRow}\n`);
  
  const enrichedFirms = [];
  const failed = [];
  
  for (const firm of NEW_FIRMS) {
    console.log(`\n--- Enriching: ${firm.name} ---`);
    console.log(`    Website: ${firm.website}`);
    
    // Extract domain
    let domain = firm.website.replace(/^https?:\/\//i, '').replace(/\/$/, '');
    domain = domain.split('/')[0];
    
    try {
      // Search Apollo for decision-makers
      const apolloResponse = await fetch('https://api.apollo.io/v1/mixed_people/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({
          api_key: APOLLO_API_KEY,
          q_organization_domains: [domain],
          person_titles: [
            'CEO', 'CTO', 'COO', 'President', 'CFO',
            'Managing Partner', 'Operating Partner', 'General Partner', 'Partner',
            'Managing Director', 'Director Technology', 'Director Digital',
            'VP Technology', 'VP Operations', 'VP Digital Transformation',
            'Head of Portfolio', 'Head of Operations', 'Head of Digital'
          ],
          per_page: 10,
        }),
      });
      
      const data = await apolloResponse.json();
      
      if (data.people && data.people.length > 0) {
        // Find the best contact (prefer Partners/Managing Directors with valid emails)
        const person = data.people.find(p => {
          if (!p.email || /@apollo\.io$/.test(p.email)) return false;
          const title = (p.title || '').toLowerCase();
          return title.includes('partner') || title.includes('managing director') || 
                 title.includes('president') || title.includes('ceo');
        }) || data.people.find(p => p.email && !/@apollo\.io$/.test(p.email));
        
        if (person) {
          console.log(`    ✅ Found: ${person.name}`);
          console.log(`       Title: ${person.title || 'N/A'}`);
          console.log(`       Email: ${person.email}`);
          
          enrichedFirms.push({
            companyName: firm.name,
            contact: person.name,
            title: person.title || '',
            email: person.email,
            website: firm.website,
            linkedin: person.linkedin_url || '',
            sector: firm.sector,
            status: `Enriched via Apollo - ${new Date().toISOString().split('T')[0]}`,
            notes: firm.notes,
          });
        } else {
          console.log('    ⚠️  Found people but no valid emails');
          failed.push({ ...firm, error: 'No valid emails' });
        }
      } else {
        console.log('    ⚠️  No people found in Apollo');
        failed.push({ ...firm, error: 'Not found in Apollo' });
      }
      
      // Rate limit: 2 seconds between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.log(`    ❌ Error: ${error.message}`);
      failed.push({ ...firm, error: error.message });
    }
  }
  
  console.log(`\n\n=== ENRICHMENT COMPLETE ===`);
  console.log(`✅ Successfully enriched: ${enrichedFirms.length}`);
  console.log(`❌ Failed: ${failed.length}\n`);
  
  // Add to sheet
  if (enrichedFirms.length > 0) {
    console.log('2. Adding firms to Google Sheet...\n');
    
    let currentRow = nextRow;
    for (const firm of enrichedFirms) {
      const values = [[
        firm.companyName,
        '', // NotebookLM (empty)
        firm.contact,
        firm.title,
        firm.email,
        firm.website,
        firm.linkedin,
        firm.sector,
        '', // Portfolio Companies (empty)
        firm.status,
        '', // Last Contacted (empty)
        firm.notes,
        '', // Company Info URL (empty)
        '', // Gumbo Score (empty)
      ]];
      
      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: 'Sheet1!A:N',
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: { values },
      });
      
      console.log(`   ✅ Added: ${firm.companyName} - ${firm.contact}`);
      currentRow++;
    }
  }
  
  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    firms_attempted: NEW_FIRMS.length,
    firms_added: enrichedFirms.length,
    firms_failed: failed.length,
    added: enrichedFirms,
    failed: failed,
  };
  
  const fs = require('fs');
  fs.writeFileSync(
    path.join(__dirname, 'new-firms-report-march12-11pm.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n✅ Done! Report saved to new-firms-report-march12-11pm.json');
  
  // Print summary
  console.log('\n=== FINAL SUMMARY ===');
  console.log(`New firms added to sheet: ${enrichedFirms.length}`);
  enrichedFirms.forEach(f => {
    console.log(`  • ${f.companyName}: ${f.contact} (${f.email})`);
  });
  
  if (failed.length > 0) {
    console.log(`\nFailed to enrich: ${failed.length}`);
    failed.forEach(f => {
      console.log(`  • ${f.name}: ${f.error}`);
    });
  }
}

enrichAndAdd().catch(console.error);
