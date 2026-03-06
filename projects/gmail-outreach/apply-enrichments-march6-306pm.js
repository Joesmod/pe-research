const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

async function getClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function applyEnrichments() {
  const enrichments = JSON.parse(
    fs.readFileSync('enrichment-updates-march6-306pm.json', 'utf8')
  );

  const sheets = await getClient();
  
  console.log(`\n=== APPLYING ${enrichments.length} ENRICHMENTS ===\n`);
  
  for (const enrichment of enrichments) {
    const { rowIndex, company, contactName, title, email, source, notes } = enrichment;
    
    console.log(`Row ${rowIndex}: ${company}`);
    console.log(`  → ${contactName} (${title})`);
    console.log(`  → ${email}`);
    
    // Column indices: C=Contact Name, D=Title, E=Email, J=Status, L=Notes
    const updates = [
      {
        range: `Sheet1!C${rowIndex}`,
        values: [[contactName]]
      },
      {
        range: `Sheet1!D${rowIndex}`,
        values: [[title]]
      },
      {
        range: `Sheet1!E${rowIndex}`,
        values: [[email]]
      },
      {
        range: `Sheet1!J${rowIndex}`,
        values: [['Enriched']]
      },
      {
        range: `Sheet1!L${rowIndex}`,
        values: [[`${notes} Source: ${source} [Enriched: 2026-03-06 cron]`]]
      }
    ];
    
    for (const update of updates) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: update.range,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: update.values }
      });
    }
    
    console.log(`  ✓ Updated\n`);
  }
  
  console.log('=== ENRICHMENT COMPLETE ===');
}

applyEnrichments().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
