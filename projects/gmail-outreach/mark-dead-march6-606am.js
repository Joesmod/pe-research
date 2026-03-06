const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = JSON.parse(fs.readFileSync('service-account.json', 'utf8'));

const auth = new google.auth.GoogleAuth({
  credentials: SERVICE_ACCOUNT,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const deadLeads = [
  { rowIndex: 744, company: 'Funden', reason: 'Dead - Not PE Firm (fundraising platform)' },
  { rowIndex: 759, company: 'Long Ridge Partners', reason: 'Dead - Executive recruiting (not PE)' },
  { rowIndex: 753, company: 'Institutional Limited Partners Association (ILPA)', reason: 'Dead - Trade association (not PE)' }
];

async function markAsDead(rowIndex, reason) {
  const sheets = google.sheets({ version: 'v4', auth });
  
  try {
    // Update Status column (J)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Sheet1!J${rowIndex}`,
      valueInputOption: 'RAW',
      resource: {
        values: [[reason]]
      }
    });
    
    console.log(`✓ Row ${rowIndex}: Marked as "${reason}"`);
    return true;
  } catch (error) {
    console.error(`✗ Error updating row ${rowIndex}:`, error.message);
    return false;
  }
}

(async () => {
  console.log('Marking non-PE firms as Dead...\n');
  
  for (const lead of deadLeads) {
    console.log(`${lead.company} (Row ${lead.rowIndex})`);
    await markAsDead(lead.rowIndex, lead.reason);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n✅ Dead leads marked successfully.');
})();
