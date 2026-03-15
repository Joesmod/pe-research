const { google } = require('googleapis');
const fs = require('fs');

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const findings = require('./enrichment-findings-march8-836am.json');

(async () => {
  try {
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
    
    const updates = findings.map(finding => ({
      range: `Sheet1!G${finding.rowIndex}:H${finding.rowIndex}`,
      values: [[finding.status, finding.notes]]
    }));
    
    console.log(`Updating ${updates.length} rows with dead firm findings...`);
    
    const response = await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      resource: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
    
    console.log(`✓ Updated ${response.data.totalUpdatedRows} rows`);
    console.log('\nSummary:');
    findings.forEach(f => {
      console.log(`  Row ${f.rowIndex}: ${f.firmName} - ${f.finding}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
