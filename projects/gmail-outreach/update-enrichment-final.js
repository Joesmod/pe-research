const { google } = require('googleapis');

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Read current sheet to find row numbers
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:I',
  });
  
  const rows = res.data.values;
  const updates = [];
  
  // Find and update rows
  for (let i = 0; i < rows.length; i++) {
    const firmName = rows[i][0];
    
    // Veritas Capital - Add Ramzi Musallam
    if (firmName === 'Veritas Capital') {
      updates.push({
        range: `Sheet1!B${i+1}:E${i+1}`,
        values: [['Ramzi Musallam', 'CEO & Managing Partner', 'rmusallam@veritascapital.com', 'https://www.veritascapital.com/team/ramzi-musallam/']]
      });
      updates.push({
        range: `Sheet1!I${i+1}`,
        values: [['Enriched']]
      });
      updates.push({
        range: `Sheet1!H${i+1}`,
        values: [['CEO & Managing Partner via company website; $45B AUM']]
      });
      console.log(`Found Veritas Capital at row ${i+1}`);
    }
    
    // Welsh Carson - Add D. Scott Mackesy
    if (firmName && (firmName === 'Welsh, Carson, Anderson & Stowe' || firmName === 'Welsh Carson' || firmName.includes('Welsh'))) {
      updates.push({
        range: `Sheet1!B${i+1}:E${i+1}`,
        values: [['D. Scott Mackesy', 'Managing Partner', 'smackesy@wcas.com', 'https://wcas.com/firm/team/d-scott-mackesy/']]
      });
      updates.push({
        range: `Sheet1!I${i+1}`,
        values: [['Enriched']]
      });
      updates.push({
        range: `Sheet1!H${i+1}`,
        values: [['Managing Partner via company website; email format [first_initial][last]@wcas.com']]
      });
      console.log(`Found Welsh Carson at row ${i+1}`);
    }
  }
  
  // Batch update
  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        data: updates,
        valueInputOption: 'RAW',
      },
    });
    console.log(`\nSuccessfully updated ${updates.length} cells`);
  } else {
    console.log('No updates found for Veritas or Welsh Carson');
  }
}

updateSheet().catch(console.error);
