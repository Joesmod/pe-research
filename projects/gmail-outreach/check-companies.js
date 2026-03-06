const { google } = require('googleapis');

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: './service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A:A'
  });
  
  const rows = res.data.values || [];
  
  // Find our target companies
  const targets = ['W Capital Partners', 'Alta Park Capital, LP', 'Kinect Capital'];
  
  rows.forEach((row, idx) => {
    if (targets.includes(row[0])) {
      console.log(`Found "${row[0]}" at row ${idx + 1}`);
    }
  });
}

main().catch(console.error);
