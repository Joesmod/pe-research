const {google} = require('googleapis');
const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const newContacts = [
  // LLR Partners - from team page
  ['LLR Partners', '', 'Dylan Dempsey', 'Head of Data & Analytics', '', '', '', 'Found on llrpartners.com/team. Data & analytics leadership at growth equity firm.'],
  ['LLR Partners', '', 'Ben Johnson', 'Managing Director, Product Management', '', '', '', 'Found on llrpartners.com/team. Product management leadership.'],
  ['LLR Partners', '', 'Jim Murphy', 'Senior Managing Director, Value Creation', '', '', '', 'Found on llrpartners.com/team. Leads value creation - AI/tech relevant.'],
  
  // Roark Capital - has internal tech team with emails from team page
  ['Roark Capital Group', '9', 'Brandon Alvarez', 'Software Engineer', 'balvarez@roarkcapital.com', 'verified', '', 'Found on roarkcapital.com/ourteam. Internal tech team. Email from team page.'],
  ['Roark Capital Group', '9', 'Rebecca Auzenne', 'Staff Software Engineer', 'rauzenne@roarkcapital.com', 'verified', '', 'Found on roarkcapital.com/ourteam. DevOps/data engineering background. Email from team page.'],
  ['Roark Capital Group', '9', 'Rob Cochran', 'Senior Systems Architect', 'RCochran@roarkcapital.com', 'verified', '', 'Found on roarkcapital.com/ourteam. Systems architecture. Email from team page.'],
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
