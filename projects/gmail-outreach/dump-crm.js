const {google} = require('googleapis');
const fs = require('fs');

(async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });
  
  const sheets = google.sheets({version: 'v4', auth: await auth.getClient()});
  const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  console.log('Fetching Sheet1...');
  const sheet1Res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:Z'
  });
  fs.writeFileSync('_sheet1_dump.json', JSON.stringify(sheet1Res.data.values || [], null, 2));
  console.log(`Sheet1: ${sheet1Res.data.values.length} rows`);
  
  console.log('Fetching Contacts...');
  const contactsRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Contacts!A:Z'
  });
  fs.writeFileSync('_contacts_dump.json', JSON.stringify(contactsRes.data.values || [], null, 2));
  console.log(`Contacts: ${contactsRes.data.values.length} rows`);
  
  console.log('✅ CRM data dumped');
})();
