const {google} = require('googleapis');
const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// New AI/tech contacts found via team page research
// NOTE: No emails - we don't guess. Just adding names/titles/LinkedIn for now.
const newContacts = [
  // Patient Square Capital - from team page
  ['Patient Square Capital', '', 'Sam Saini', 'Head of Technology', '', '', '', 'Found on patientsquarecapital.com/team. Tech leadership role at healthcare PE firm.'],
  ['Patient Square Capital', '', 'Ryan Peabody', 'Data Analytics Lead', '', '', '', 'Found on patientsquarecapital.com/team. Data analytics leadership.'],
  ['Patient Square Capital', '', 'Karr Narula', 'Founding Partner, Head of Transformation and Growth', '', '', '', 'Found on patientsquarecapital.com/team. Transformation & Growth - AI-adjacent.'],
  
  // New Mountain Capital - from team page
  ['New Mountain Capital', '7', 'Jeff Hammerbacher', 'Senior Advisor (Data/AI)', '', '', '', 'Found on newmountaincapital.com/team. Co-founder of Cloudera, former Facebook data team lead. Major AI/data figure.'],
  ['New Mountain Capital', '7', 'Clark Golestani', 'Senior Advisor (Technology)', '', '', '', 'Found on newmountaincapital.com/team. Former Global CIO at Accenture.'],
  
  // Motive Partners - from team page  
  ['Motive Partners', '', 'Etienne Castiaux', 'Founding Partner & CTO in Engineering', '', '', '', 'Found on motivepartners.com/team. CTO role at fintech-focused PE firm.'],
  ['Motive Partners', '', 'Sreeram Visvanathan', 'Partner & Head of Create', '', '', '', 'Found on motivepartners.com/team. Leads value creation / technology transformation.'],
  
  // Vista Equity Partners - from team page
  ['Vista Equity Partners', '', 'Nadeem Syed', 'Senior Managing Director, Head of Value Creation', '', '', '', 'Found on vistaequitypartners.com/about/team. Leads value creation across software portfolio - AI-relevant.'],
];

(async () => {
  const sheets = google.sheets({version: 'v4', auth: await auth.getClient()});
  
  // Check what's already there to avoid duplicates
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
  
  console.log(`Adding ${toAdd.length} new AI/tech contacts...`);
  toAdd.forEach(r => console.log(`  ${r[0]} | ${r[2]} | ${r[3]}`));
  
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Contacts!A:I',
    valueInputOption: 'RAW',
    resource: { values: toAdd }
  });
  
  console.log('Done! Added to Contacts sheet.');
})();
