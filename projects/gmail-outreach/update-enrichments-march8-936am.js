const { google } = require('googleapis');
const fs = require('fs');

async function updateSheet() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
    
    // Load findings
    const findings = JSON.parse(fs.readFileSync('enrichment-findings-march8-936am.json', 'utf8'));
    
    console.log(`\n📝 Updating ${findings.length} enriched leads...`);
    
    const updates = [];
    
    for (const finding of findings) {
      // Skip if email needs verification
      if (finding.email === 'NEEDS_VERIFICATION') {
        console.log(`⏭️  Skipping ${finding.firm} - email needs verification`);
        continue;
      }
      
      // Column mapping: C=Contact Name (3), D=Title (4), E=Email (5), F=LinkedIn (6), J=Status (10), K=Notes (11)
      const row = finding.rowIndex;
      
      updates.push({
        range: `Sheet1!C${row}`,
        values: [[finding.contactName]]
      });
      
      updates.push({
        range: `Sheet1!D${row}`,
        values: [[finding.title]]
      });
      
      updates.push({
        range: `Sheet1!E${row}`,
        values: [[finding.email]]
      });
      
      updates.push({
        range: `Sheet1!F${row}`,
        values: [[finding.linkedIn]]
      });
      
      updates.push({
        range: `Sheet1!J${row}`,
        values: [['Enriched']]
      });
      
      const notes = `${finding.notes} | Source: ${finding.source} | Enriched: ${new Date().toISOString().split('T')[0]}`;
      updates.push({
        range: `Sheet1!K${row}`,
        values: [[notes]]
      });
      
      console.log(`✅ Row ${row}: ${finding.firm} - ${finding.contactName} (${finding.title})`);
    }
    
    if (updates.length === 0) {
      console.log('\n⚠️  No verified updates to apply');
      return;
    }
    
    // Batch update
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: updates
      }
    });
    
    console.log(`\n✅ Successfully updated ${updates.length / 6} rows`);
    console.log('\n📊 Summary:');
    console.log(`   - Enriched: ${updates.length / 6} firms`);
    console.log(`   - Remaining: ${46 - (updates.length / 6)} firms still need research`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

updateSheet().then(() => {
  console.log('\n✅ Update complete!');
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
