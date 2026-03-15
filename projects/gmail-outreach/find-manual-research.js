const { google } = require('googleapis');

async function findManualResearch() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:I'
  });
  
  const rows = result.data.values;
  
  console.log('Firms needing manual research:\n');
  
  let count = 0;
  for (let i = 1; i < rows.length; i++) {
    const status = rows[i][7];
    
    if (status === 'Needs Manual Research' || status === 'Enriched - Needs Email Verification') {
      const company = rows[i][0];
      const contact = rows[i][2];
      const email = rows[i][4];
      const website = rows[i][1];
      
      console.log(`Row ${i+1}: ${company}`);
      console.log(`  Website: ${website}`);
      console.log(`  Contact: ${contact || 'EMPTY'}`);
      console.log(`  Email: ${email || 'EMPTY'}`);
      console.log(`  Status: ${status}`);
      console.log('');
      
      count++;
      if (count >= 15) break;
    }
  }
  
  console.log(`\nTotal found: ${count}`);
}

findManualResearch().catch(console.error);
