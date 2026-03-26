const { google } = require('googleapis');

async function findFirms(firmNames) {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const r = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A1:N1500'
  });
  
  const rows = r.data.values;
  firmNames.forEach(firmName => {
    rows.forEach((row, i) => {
      if (row[0] && row[0].toLowerCase().includes(firmName.toLowerCase())) {
        console.log(`Row ${i + 1}: ${row[0]}`);
      }
    });
  });
}

const firms = ['Linden Capital', 'Gridiron Capital', 'Norwest Equity'];
findFirms(firms).catch(console.error);
