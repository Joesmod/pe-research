const { google } = require('googleapis');

const targets = [
  { row: 39, firm: 'Ampersand Capital Partners', contact: 'Herbert Hooper' },
  { row: 700, firm: 'American Industrial Partners', contact: 'Kim Marvin' },
  { row: 989, firm: 'Linsalata Capital Partners', contact: 'Eric Bacon' },
  { row: 990, firm: 'High Road Capital Partners', contact: 'Robert Fitzsimmons' },
  { row: 991, firm: 'Pharos Capital Group', contact: 'Kneeland Youngblood' },
  { row: 992, firm: 'Shoreview Capital', contact: 'Peter Zimmerman' }
];

async function updateSheet(enrichments) {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  const sheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  for (const enrichment of enrichments) {
    const updates = [];
    
    // Update Email (column E)
    if (enrichment.email) {
      updates.push({
        range: `Sheet1!E${enrichment.row}`,
        values: [[enrichment.email]]
      });
    }
    
    // Update LinkedIn (column G)
    if (enrichment.linkedin) {
      updates.push({
        range: `Sheet1!G${enrichment.row}`,
        values: [[enrichment.linkedin]]
      });
    }
    
    // Update Title (column D)
    if (enrichment.title) {
      updates.push({
        range: `Sheet1!D${enrichment.row}`,
        values: [[enrichment.title]]
      });
    }
    
    // Update Status (column J)
    updates.push({
      range: `Sheet1!J${enrichment.row}`,
      values: [[`Enriched - ${new Date().toISOString().split('T')[0]}`]]
    });
    
    if (updates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: sheetId,
        resource: {
          valueInputOption: 'RAW',
          data: updates
        }
      });
      console.log(`✓ Updated row ${enrichment.row}: ${enrichment.firm}`);
    }
  }
}

console.log('=== ENRICHMENT TARGETS ===\n');
targets.forEach((t, i) => {
  console.log(`${i + 1}. Row ${t.row}: ${t.firm} - ${t.contact}`);
});

console.log('\n\nReady to update sheet once enrichment data is provided.');
console.log('Call updateSheet() with enrichment array.');

module.exports = { updateSheet, targets };
