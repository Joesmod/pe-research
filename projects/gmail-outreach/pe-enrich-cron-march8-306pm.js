const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const credentials = JSON.parse(fs.readFileSync('service-account.json'));

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

// Research findings from manual web research
const enrichments = [
  {
    company: 'Aeris Partners',
    contactName: 'David Joncas',
    title: 'Co-Founder & Managing Director',
    email: 'dwj@aerispartners.com',
    linkedin: 'https://www.linkedin.com/in/david-joncas-206a0424/',
    notes: 'M&A advisory firm (not PE investor), verified email from ContactOut',
    source: 'ContactOut, LinkedIn',
    status: 'Enriched'
  },
  {
    company: 'Carmel Capital Partners',
    contactName: 'Russell Silberstein',
    title: 'Founder & Principal',
    email: '', // Could not verify exact email format
    linkedin: 'https://www.linkedin.com/in/russell-silberstein-8b5a667/',
    notes: 'Wealth management/RIA firm. Phone: (858) 457-7544. Email domain likely @carmelcap.com but not verified',
    source: 'LinkedIn, Crunchbase, Form ADV',
    status: 'Partial'
  }
];

(async () => {
  console.log('=== PE ENRICHMENT CRON - March 8, 3:06 PM ===\n');
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read current sheet
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'A:J'
  });
  
  const rows = response.data.values;
  const headers = rows[0];
  
  console.log(`Total rows in sheet: ${rows.length}`);
  console.log(`Enrichments to apply: ${enrichments.length}\n`);
  
  let updates = [];
  
  for (const enrich of enrichments) {
    // Find the row for this company
    for (let i = 1; i < rows.length; i++) {
      const companyName = rows[i][0] || '';
      
      if (companyName.toLowerCase().includes(enrich.company.toLowerCase()) || 
          enrich.company.toLowerCase().includes(companyName.toLowerCase())) {
        
        const rowNum = i + 1; // 1-indexed for Google Sheets
        
        console.log(`Updating row ${rowNum}: ${companyName}`);
        console.log(`  Contact: ${enrich.contactName}`);
        console.log(`  Title: ${enrich.title}`);
        console.log(`  Email: ${enrich.email || '(not verified)'}`);
        console.log(`  LinkedIn: ${enrich.linkedin}`);
        console.log(`  Notes: ${enrich.notes}\n`);
        
        // Column mapping: C=Contact, D=Title, E=Email, G=LinkedIn
        if (enrich.contactName) {
          updates.push({
            range: `C${rowNum}`,
            values: [[enrich.contactName]]
          });
        }
        
        if (enrich.title) {
          updates.push({
            range: `D${rowNum}`,
            values: [[enrich.title]]
          });
        }
        
        if (enrich.email) {
          updates.push({
            range: `E${rowNum}`,
            values: [[enrich.email]]
          });
        }
        
        if (enrich.linkedin) {
          updates.push({
            range: `G${rowNum}`,
            values: [[enrich.linkedin]]
          });
        }
        
        if (enrich.status) {
          updates.push({
            range: `J${rowNum}`,
            values: [[enrich.status]]
          });
        }
        
        break;
      }
    }
  }
  
  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
    
    console.log(`\n✓ Applied ${updates.length} cell updates to sheet`);
  } else {
    console.log('\nNo updates to apply.');
  }
  
  // Summary
  console.log('\n=== ENRICHMENT SUMMARY ===');
  console.log(`Firms researched: ${enrichments.length}`);
  console.log(`Fully enriched (with verified email): 1`);
  console.log(`Partially enriched (no verified email): 1`);
  console.log('\nNext steps: Continue researching remaining 40 firms needing enrichment');
  
})().catch(console.error);
