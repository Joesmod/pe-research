const { google } = require('googleapis');

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // First, get current data to find the right rows
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:J'
  });
  
  const rows = response.data.values;
  const updates = [];
  
  // Find and update rows
  rows.forEach((row, index) => {
    const firmName = row[0];
    const rowNumber = index + 1;
    
    // Lone Star Funds
    if (firmName && firmName.includes('Lone Star')) {
      updates.push({
        range: `Sheet1!C${rowNumber}:J${rowNumber}`,
        values: [[
          'John Grayken',
          'Founder',
          'MediaRelations@lonestarfunds.com',
          '',  // Phone
          '',  // LinkedIn
          'Enriched',
          'Official website media contact email',
          new Date().toISOString().split('T')[0]
        ]]
      });
    }
    
    // Warburg Pincus
    if (firmName && firmName.includes('Warburg Pincus')) {
      updates.push({
        range: `Sheet1!C${rowNumber}:J${rowNumber}`,
        values: [[
          'Lisa Liang',
          'Senior Vice President - Head of Marketing and Communications, Asia',
          'lisa.liang@warburgpincus.com',
          '',  // Phone
          '',  // LinkedIn
          'Enriched',
          'Official website news/contact page',
          new Date().toISOString().split('T')[0]
        ]]
      });
    }
    
    // Providence Equity Partners
    if (firmName && firmName.includes('Providence Equity')) {
      updates.push({
        range: `Sheet1!C${rowNumber}:J${rowNumber}`,
        values: [[
          'Investor Relations',
          'Investor Relations Team',
          'investors@provequity.com',
          '',  // Phone
          '',  // LinkedIn
          'Enriched',
          'Official website contact page',
          new Date().toISOString().split('T')[0]
        ]]
      });
    }
  });
  
  // Batch update
  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      resource: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
    
    console.log(`Updated ${updates.length} rows successfully`);
    updates.forEach(u => console.log(`  - ${u.range}`));
  } else {
    console.log('No matching firms found to update');
  }
}

updateSheet().catch(console.error);
