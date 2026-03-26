const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');

const enrichments = [
  {
    rowNum: 1067,
    company: 'Trivest Partners',
    contact: 'Forest Wester',
    title: 'Managing Partner, Discovery',
    email: 'fwester@trivest.com',
    linkedin: 'https://www.linkedin.com/in/forest-wester',
    notes: 'Email pattern inferred from ContactOut (f******@trivest.com). Confirmed as Managing Partner, Discovery on official team page (trivest.com/team). ContactOut published source. Enriched 2026-03-15 cron.'
  },
  {
    rowNum: 1226,
    company: 'Gryphon Investors',
    contact: 'R. David Andrews',
    title: 'Founder & Co-CEO, Managing Partner',
    email: 'dandrews@gryphoninvestors.com',
    linkedin: 'https://www.linkedin.com/in/r-david-andrews',
    notes: 'Email pattern inferred from gryphon-inv.com verified domain (@gryphoninvestors.com). Founder & Co-CEO per official team page. Pattern: firstinitiallastname@gryphoninvestors.com (careers@, compliance@ confirmed). Needs verification. Enriched 2026-03-15 cron.'
  },
  {
    rowNum: 1251,
    company: 'Altaris Capital Partners',
    contact: 'Daniel Tully',
    title: 'Co-Founder & Managing Director',
    email: 'daniel.tully@altariscap.com',
    linkedin: 'https://www.linkedin.com/in/daniel-tully-altaris',
    notes: 'Email pattern verified from altariscap.com (charles.mullens@altariscap.com published). Pattern: firstname.lastname@altariscap.com. Co-Founder & Managing Director per Signal/Crunchbase. High confidence. Enriched 2026-03-15 cron.'
  },
  {
    rowNum: 1255,
    company: 'ShoreView',
    contact: 'Scott Gage',
    title: 'Partner',
    email: 'scott@shoreview.com',
    linkedin: 'https://www.linkedin.com/in/scott-gage-33b7b44',
    notes: 'Email pattern verified from shoreview.com (brittney@shoreview.com published). Pattern: firstname@shoreview.com. Partner per official LinkedIn/ZoomInfo. RocketReach partial s******@shoreview.com confirms. High confidence. Enriched 2026-03-15 cron.'
  }
];

// Row 1234 is duplicate of 1226, skip it

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  console.log('🚀 Updating Google Sheet with manual enrichment results...\n');
  
  for (const enrich of enrichments) {
    console.log(`Updating Row ${enrich.rowNum}: ${enrich.company}`);
    console.log(`  Contact: ${enrich.contact}`);
    console.log(`  Title: ${enrich.title}`);
    console.log(`  Email: ${enrich.email}`);
    
    const updates = [
      { range: `Sheet1!C${enrich.rowNum}`, values: [[enrich.contact]] },
      { range: `Sheet1!D${enrich.rowNum}`, values: [[enrich.title]] },
      { range: `Sheet1!E${enrich.rowNum}`, values: [[enrich.email]] },
      { range: `Sheet1!G${enrich.rowNum}`, values: [[enrich.linkedin]] },
      { range: `Sheet1!H${enrich.rowNum}`, values: [['Enriched - Verify Email']] },
      { range: `Sheet1!I${enrich.rowNum}`, values: [[enrich.notes]] }
    ];
    
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        data: updates,
        valueInputOption: 'USER_ENTERED'
      }
    });
    
    console.log(`  ✅ Updated!\n`);
  }
  
  console.log('='.repeat(60));
  console.log('📊 MANUAL ENRICHMENT SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successfully enriched: ${enrichments.length} leads`);
  console.log('Companies: Trivest, Gryphon, Altaris, ShoreView');
  console.log('All emails inferred from verified patterns');
  console.log('Status: Enriched - Verify Email');
  console.log('\n🎉 Complete!');
}

updateSheet().catch(console.error);
