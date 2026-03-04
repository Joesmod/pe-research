// Add new PE firms to the prospect sheet
const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = 'service-account.json';

async function getClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const client = await auth.getClient();
  return google.sheets({ version: 'v4', auth: client });
}

async function addFirms() {
  const sheets = await getClient();
  
  // New firms to add - mid-market PE, $500M-$5B AUM, services-heavy
  const newFirms = [
    {
      company: 'Norwest Venture Partners',
      website: 'https://www.norwest.com',
      focus: 'Growth Equity, Software, Information Services',
      geography: 'North America',
      aum: '$15B+',
      founded: '1961',
      employees: '100+',
      apolloScore: '',
      contact: 'Jon Kossow',
      title: 'Managing Partner',
      email: 'jkossow@nvp.com',
      linkedin: 'https://www.norwest.com/team/jon-kossow/',
      status: 'Enriched',
      notes: 'Verified from ContactOut - Growth equity focused'
    },
    {
      company: 'Altamont Capital Partners',
      website: 'https://www.altamontcapital.com',
      focus: 'Business Services, Healthcare, Financial Services',
      geography: 'North America',
      aum: '$4B+',
      founded: '2010',
      employees: '50+',
      apolloScore: '',
      contact: '',
      title: '',
      email: '',
      linkedin: '',
      status: 'New - Unresearched',
      notes: 'Sector: Business services, healthcare, financial services'
    },
    {
      company: 'Renovus Capital Partners',
      website: 'https://www.renovuscapital.com',
      focus: 'Business Services, Healthcare Services, Industrial Services',
      geography: 'North America',
      aum: '$2B+',
      founded: '2010',
      employees: '30+',
      apolloScore: '',
      contact: '',
      title: '',
      email: '',
      linkedin: '',
      status: 'New - Unresearched',
      notes: 'Sector: Healthcare, business, industrial services'
    },
    {
      company: 'SV Capital',
      website: 'https://www.svcap.com',
      focus: 'Business Services, Technology-Enabled Services',
      geography: 'North America',
      aum: '$1.5B+',
      founded: '2005',
      employees: '25+',
      apolloScore: '',
      contact: '',
      title: '',
      email: '',
      linkedin: '',
      status: 'New - Unresearched',
      notes: 'Sector: Tech-enabled business services'
    },
    {
      company: 'Vistria Group',
      website: 'https://www.vistriagroup.com',
      focus: 'Healthcare, Education, Financial Services',
      geography: 'North America',
      aum: '$8B+',
      founded: '2013',
      employees: '50+',
      apolloScore: '',
      contact: '',
      title: '',
      email: '',
      linkedin: '',
      status: 'New - Unresearched',
      notes: 'Sector: Healthcare, education services'
    },
  ];
  
  // Format as rows
  const rows = newFirms.map(firm => [
    firm.company,
    firm.website,
    firm.focus,
    firm.geography,
    firm.aum,
    firm.founded,
    firm.employees,
    firm.apolloScore,
    firm.contact,
    firm.title,
    firm.email,
    firm.linkedin,
    firm.status,
    firm.notes
  ]);
  
  // Append to sheet
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:N',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: rows },
  });
  
  console.log(`✓ Added ${newFirms.length} new PE firms to the sheet`);
  newFirms.forEach(f => console.log(`  - ${f.company}${f.contact ? ` (${f.contact})` : ''}`));
}

addFirms().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
