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
    
    // Evolution Credit Partners
    if (firmName === 'Evolution Credit Partners') {
      updates.push({
        range: `Sheet1!B${i+1}:E${i+1}`,
        values: [['Lisa Schwarzberg', 'Founding Partner, MD & COO', 'lschwarzberg@evolutioncreditpartners.com', 'https://www.linkedin.com/in/lisa-schwarzberg/']]
      });
      updates.push({
        range: `Sheet1!I${i+1}`,
        values: [['Enriched']]
      });
      console.log(`Found Evolution Credit Partners at row ${i+1}`);
    }
    
    // FTV Capital - update Arun Singh row
    if (firmName === 'FTV Capital' && rows[i][2] === 'Arun Singh') {
      updates.push({
        range: `Sheet1!B${i+1}:E${i+1}`,
        values: [['Brad Bernstein', 'Managing Partner', 'bbernstein@ftvcapital.com', 'https://www.linkedin.com/in/brad-bernstein-ftv/']]
      });
      updates.push({
        range: `Sheet1!I${i+1}`,
        values: [['Enriched']]
      });
      console.log(`Found FTV Capital at row ${i+1}`);
    }
    
    // Garden City Equity
    if (firmName === 'Garden City Equity') {
      updates.push({
        range: `Sheet1!D${i+1}`,
        values: [['mike@gardencityequity.com']]
      });
      updates.push({
        range: `Sheet1!I${i+1}`,
        values: [['Enriched']]
      });
      console.log(`Found Garden City Equity at row ${i+1}`);
    }
    
    // GiantLeap Capital
    if (firmName === 'GiantLeap Capital') {
      updates.push({
        range: `Sheet1!D${i+1}`,
        values: [['himanshu@giantleapcapital.com']]
      });
      updates.push({
        range: `Sheet1!I${i+1}`,
        values: [['Enriched']]
      });
      console.log(`Found GiantLeap Capital at row ${i+1}`);
    }
    
    // Graycliff Partners
    if (firmName === 'Graycliff Partners') {
      updates.push({
        range: `Sheet1!D${i+1}`,
        values: [['shindmarch@graycliffpartners.com']]
      });
      updates.push({
        range: `Sheet1!I${i+1}`,
        values: [['Enriched']]
      });
      console.log(`Found Graycliff Partners at row ${i+1}`);
    }
    
    // Hunter Point Capital
    if (firmName === 'Hunter Point Capital') {
      updates.push({
        range: `Sheet1!B${i+1}:E${i+1}`,
        values: [['Avshalom Kalichstein', 'CEO & Co-Founder', 'akalichstein@hunterpointcapital.com', 'https://www.linkedin.com/in/avshalom-kalichstein/']]
      });
      updates.push({
        range: `Sheet1!I${i+1}`,
        values: [['Enriched']]
      });
      console.log(`Found Hunter Point Capital at row ${i+1}`);
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
    console.log(`\nSuccessfully updated ${updates.length} cells across ${updates.length / 2} firms`);
  } else {
    console.log('No updates found');
  }
}

updateSheet().catch(console.error);
