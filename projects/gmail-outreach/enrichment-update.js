const { google } = require('googleapis');
const key = require('./service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Updates to make - row numbers are 1-indexed including header
  const updates = [
    // Graycliff Partners - Row 21 (approximate)
    {
      range: 'E21', // Email column
      value: 'shindmarch@graycliffpartners.com'
    },
    {
      range: 'K21', // Status column
      value: 'Enriched'
    },
    {
      range: 'J21', // Notes column  
      value: 'Email verified from ContactOut 2026-03-15. Partner at Graycliff Partners LP. Seattle-based PE firm.'
    }
  ];
  
  // Batch update
  const batchData = updates.map(u => ({
    range: u.range,
    values: [[u.value]]
  }));
  
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    resource: {
      valueInputOption: 'RAW',
      data: batchData
    }
  });
  
  console.log(`Updated ${updates.length} cells`);
}

updateSheet().catch(console.error);
