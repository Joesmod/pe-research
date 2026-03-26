const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: __dirname + '/service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
});

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function run() {
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  
  // Check Contacts sheet
  const contactsRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Contacts!A2:K1000'
  });
  
  const contacts = contactsRes.data.values || [];
  const hunterContacts = contacts.filter(row => 
    (row[1] || '').toLowerCase().includes('hunter') || 
    (row[1] || '').toLowerCase().includes('jeff')
  );
  
  console.log('=== Jeff Hunter in Contacts ===');
  hunterContacts.forEach((row, idx) => {
    console.log(`Row ${idx + 2}:`, {
      company: row[0],
      name: row[1],
      title: row[2],
      email: row[3],
      linkedin: row[4],
      source: row[5],
      verified: row[6],
      gumboScore: row[7],
      lastContacted: row[8],
      notes: row[9]
    });
  });
  
  // Check Sheet1
  const sheet1Res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A2:K1000'
  });
  
  const companies = sheet1Res.data.values || [];
  const jllRows = companies.filter(row => 
    (row[0] || '').toLowerCase().includes('jll')
  );
  
  console.log('\n=== JLL Partners in Sheet1 ===');
  jllRows.forEach((row, idx) => {
    console.log(`Row ${idx + 2}:`, {
      company: row[0],
      domain: row[1],
      status: row[8],
      lastContacted: row[9]
    });
  });
}

run().catch(console.error);
