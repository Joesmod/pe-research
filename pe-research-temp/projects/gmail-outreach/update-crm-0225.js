const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SA_PATH = __dirname + '/service-account.json';

async function getAuth() {
  const sa = JSON.parse(fs.readFileSync(SA_PATH));
  const auth = new google.auth.GoogleAuth({ credentials: sa, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
  return auth;
}

async function run() {
  const auth = await getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  const now = new Date().toISOString();

  // Update Sheet1 — find companies and update Status (col I) + Last Contacted (col J)
  const sheet1 = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Sheet1!A:J' });
  const rows = sheet1.data.values || [];
  
  const companies = ['Vistria', 'Lee Equity', 'Berkshire Partners', 'GTCR'];
  const updates = [];
  
  for (let i = 1; i < rows.length; i++) {
    const name = (rows[i][0] || '').toLowerCase();
    for (const co of companies) {
      if (name.includes(co.toLowerCase())) {
        updates.push({ range: `Sheet1!I${i+1}`, values: [['Contacted']] });
        updates.push({ range: `Sheet1!J${i+1}`, values: [[now]] });
        console.log(`Sheet1 row ${i+1}: ${rows[i][0]} → Contacted`);
      }
    }
  }

  // Update Contacts sheet — find emails and update Last Contacted (col I)
  const contacts = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Contacts!A:I' });
  const cRows = contacts.data.values || [];
  
  const emails = ['cchock@vistriaprg.com', 'pmurray@leeequity.com', 'esouza@berkshirepartners.com', 'joe.rubino@gtcr.com'];
  
  for (let i = 1; i < cRows.length; i++) {
    const row = cRows[i];
    const email = (row[3] || row[4] || '').toLowerCase(); // check cols D and E for email
    for (const e of emails) {
      if (row.join('|').toLowerCase().includes(e)) {
        updates.push({ range: `Contacts!I${i+1}`, values: [[now]] });
        console.log(`Contacts row ${i+1}: ${e} → ${now}`);
      }
    }
  }

  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: { valueInputOption: 'RAW', data: updates }
    });
    console.log(`\n✅ Updated ${updates.length} cells`);
  } else {
    console.log('No matching rows found');
  }
}

run().catch(e => console.error(e));
