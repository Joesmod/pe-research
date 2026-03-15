const { google } = require('googleapis');
const SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function debug() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  const contactsData = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Contacts!A:I',
  });
  
  const contacts = contactsData.data.values.slice(1, 11); // Just first 10 for debugging
  
  console.log('Sample contacts:');
  contacts.forEach((row, i) => {
    console.log(`Row ${i}:`, {
      company: row[0],
      name: row[1],
      title: row[2],
      email: row[3],
      status: row[4],
      lastContacted: row[8]
    });
  });
  
  console.log('\nTotal rows:', contactsData.data.values.length - 1);
}

debug().catch(console.error);
