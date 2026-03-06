const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = JSON.parse(fs.readFileSync('service-account.json'));

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    credentials: SERVICE_ACCOUNT,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Updates to make (row number is 1-indexed, A1 notation)
  const updates = [
    {
      row: 569,
      firm: 'Base10 Partners',
      status: 'Dead - VC Firm',
      notes: 'Venture capital firm ($1B+ AUM, early-stage tech). Not mid-market PE. Researched 2026-03-06.'
    },
    {
      row: 737,
      firm: 'Dynamics Search Partners',
      status: 'Dead - Not PE Firm',
      notes: 'Executive search/recruiting firm for PE industry. Not an investor. Researched 2026-03-06.'
    },
    {
      row: 741,
      firm: 'Essex Investment Management',
      status: 'Dead - Asset Manager',
      notes: 'Public equity asset manager (SEC-registered RIA, 13F filer). Not PE. Researched 2026-03-06.'
    },
    {
      row: 750,
      firm: 'Highland Capital Partners',
      status: 'Dead - VC Firm',
      notes: 'Venture capital firm (founded 1987, $4B+ AUM, 280+ early-stage cos). Not mid-market PE. Researched 2026-03-06.'
    }
  ];
  
  // Column J = Status (index 9), Column K = Notes/Last Contacted (index 10)
  const updateRequests = updates.map(u => ({
    range: `Sheet1!J${u.row}:K${u.row}`,
    values: [[u.status, u.notes]]
  }));
  
  try {
    const response = await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      resource: {
        valueInputOption: 'USER_ENTERED',
        data: updateRequests
      }
    });
    
    console.log(`✓ Updated ${updates.length} rows in Google Sheet`);
    console.log('Updated firms:');
    updates.forEach(u => {
      console.log(`  - Row ${u.row}: ${u.firm} → ${u.status}`);
    });
    
    return response.data;
  } catch (error) {
    console.error('Error updating sheet:', error.message);
    throw error;
  }
}

updateSheet().catch(console.error);
