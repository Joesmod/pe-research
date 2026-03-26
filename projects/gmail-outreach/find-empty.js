const { google } = require('googleapis');

async function findEmpty() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const ranges = ['Sheet1!A700:N800', 'Sheet1!A900:N1000', 'Sheet1!A1100:N1200'];
  
  for (const range of ranges) {
    const r = await sheets.spreadsheets.values.get({
      spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
      range
    });
    
    const startRow = parseInt(range.match(/\d+/)[0]);
    if (!r.data.values) continue;
    
    r.data.values.forEach((row, i) => {
      const company = row[0] || '';
      const contact = row[2] || '';
      const email = row[4] || '';
      
      if (company.length > 3 && !contact && !email) {
        console.log(`${startRow + i},${company}`);
      }
    });
  }
}

findEmpty().catch(console.error);
