const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: __dirname + '/service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
});

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function run() {
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  
  // Get all data from Contacts
  const contactsRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Contacts!A1:K1000'
  });
  
  const rows = contactsRes.data.values || [];
  console.log('=== Searching for "Hunter" in Contacts ===');
  console.log('Headers:', rows[0]);
  console.log('');
  
  rows.slice(1).forEach((row, idx) => {
    const text = row.join(' ').toLowerCase();
    if (text.includes('jeff') && text.includes('hunter')) {
      console.log(`Row ${idx + 2}:`, row);
    }
  });
  
  console.log('\n=== Searching for "jll" in Contacts ===');
  rows.slice(1).forEach((row, idx) => {
    const text = row.join(' ').toLowerCase();
    if (text.includes('jll')) {
      console.log(`Row ${idx + 2}:`, row);
    }
  });
}

run().catch(console.error);
