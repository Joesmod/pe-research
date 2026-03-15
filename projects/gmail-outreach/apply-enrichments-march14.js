const { google } = require('googleapis');
const fs = require('fs');

async function applyEnrichments() {
  const enrichmentData = JSON.parse(
    fs.readFileSync('enrichment-data-march14.json', 'utf8')
  );
  
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  console.log('=== APPLYING ENRICHMENTS TO GOOGLE SHEET ===\n');
  
  for (const enrichment of enrichmentData.enrichments) {
    const row = enrichment.row;
    
    console.log(`\nRow ${row}: ${enrichment.firm}`);
    console.log(`  Contact: ${enrichment.contact} (${enrichment.title})`);
    console.log(`  Email: ${enrichment.email} [${enrichment.confidence}]`);
    console.log(`  Source: ${enrichment.source}`);
    
    // Update multiple columns in one batch
    const updates = [
      {
        range: `Sheet1!D${row}`,
        values: [[enrichment.contact]]
      },
      {
        range: `Sheet1!E${row}`,
        values: [[enrichment.title]]
      },
      {
        range: `Sheet1!F${row}`,
        values: [[enrichment.email]]
      },
      {
        range: `Sheet1!G${row}`,
        values: [[enrichment.linkedin]]
      },
      {
        range: `Sheet1!I${row}`,
        values: [[enrichment.status]]
      },
      {
        range: `Sheet1!J${row}`,
        values: [[enrichment.notes]]
      },
      {
        range: `Sheet1!K${row}`,
        values: [['2026-03-14']]
      }
    ];
    
    // Apply updates
    for (const update of updates) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: update.range,
        valueInputOption: 'RAW',
        requestBody: {
          values: update.values
        }
      });
    }
    
    console.log(`  ✅ Updated row ${row}`);
    
    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n\n=== ENRICHMENT SUMMARY ===');
  console.log(`Total leads enriched: ${enrichmentData.summary.total_enriched}`);
  console.log(`Verified emails: ${enrichmentData.summary.verified_emails}`);
  console.log(`High confidence: ${enrichmentData.summary.high_confidence}`);
  console.log(`Pattern inferred: ${enrichmentData.summary.pattern_inferred}`);
  console.log('\nSources used:');
  enrichmentData.summary.sources.forEach(source => {
    console.log(`  - ${source}`);
  });
  console.log('\n✅ All enrichments applied to Google Sheet successfully!');
}

applyEnrichments().catch(console.error);
