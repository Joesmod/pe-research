const { google } = require('googleapis');

async function updateRow() {
  const args = process.argv.slice(2);
  
  if (args.length < 6) {
    console.log('Usage: node update-row.js <row> <name> <title> <email> <linkedin> <status> <notes>');
    process.exit(1);
  }
  
  const [row, name, title, email, linkedin, status, notes] = args;
  
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const today = new Date().toISOString().split('T')[0];
  
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Sheet1!C${row}:J${row}`,
    valueInputOption: 'RAW',
    resource: {
      values: [[name, title, email, '', linkedin, status, notes, today]]
    }
  });
  
  console.log(`Updated row ${row}`);
}

updateRow().catch(console.error);
