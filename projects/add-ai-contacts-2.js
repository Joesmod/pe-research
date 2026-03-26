const {google} = require('googleapis');
const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const newContacts = [
  // Francisco Partners - from team page
  ['Francisco Partners', '', 'Jason Warner', 'Managing Director, Data Science', '', '', '', 'Found on franciscopartners.com/team. Data Science leadership at tech-focused PE firm.'],
  ['Francisco Partners', '', 'Brian Maury', 'Chief Technology Officer', '', '', '', 'Found on franciscopartners.com/team. CTO of the firm itself.'],
  
  // Summit Partners - from team page
  ['Summit Partners', '', 'Kurt Brimberry', 'Principal, Infrastructure Technology (Peak Performance Group)', '', '', '', 'Found on summitpartners.com/team. Technology & Data Science team. Works on digital transformation with portfolio companies.'],
];

(async () => {
  const sheets = google.sheets({version: 'v4', auth: await auth.getClient()});
  
  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Contacts!A2:C'
  });
  const existingNames = new Set((existing.data.values || []).map(r => `${r[0]}|${r[2]}`));
  
  const toAdd = newContacts.filter(r => !existingNames.has(`${r[0]}|${r[2]}`));
  
  if (toAdd.length === 0) {
    console.log('All contacts already exist in CRM');
    return;
  }
  
  console.log(`Adding ${toAdd.length} new contacts...`);
  toAdd.forEach(r => console.log(`  ${r[0]} | ${r[2]} | ${r[3]}`));
  
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Contacts!A:I',
    valueInputOption: 'RAW',
    resource: { values: toAdd }
  });
  
  console.log('Done!');
})();
