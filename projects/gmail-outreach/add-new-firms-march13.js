const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// New firms to add
const newFirms = [
  {
    company: 'Bow River Capital',
    notebookLM: '',
    contact: 'Greg Hiatrides',
    title: 'Partner, Head of Private Equity',
    email: 'ghiatrides@bowrivercapital.com',
    website: 'https://www.bowrivercapital.com',
    linkedin: 'https://www.linkedin.com/company/bow-river-capital',
    sectorFocus: 'Healthcare services, industrials, software',
    portfolioCompanies: '',
    status: 'New - Researched',
    lastContacted: '',
    notes: 'Denver-based, ~$2.5B AUM. Healthcare services, lower middle-market software, industrials. Recent exits: Defy Security->Booz Allen (Feb 2026), Coastal->TCS (Dec 2025). Contact email inferred from team page pattern (first initial + last name). Alt contacts: Blair Richardson (CEO), Robert Fortier (MD, PE), Gaurav Sharma (MD, PE).',
    companyInfo: '',
    gumboScore: '8'
  },
  {
    company: 'New Harbor Capital',
    notebookLM: '',
    contact: 'Thomas Formolo',
    title: 'Partner',
    email: 'tformolo@newharborcap.com',
    website: 'https://www.newharborcap.com',
    linkedin: 'https://www.linkedin.com/company/new-harbor-capital-llc',
    sectorFocus: 'Healthcare provider services, education, tech-enabled services',
    portfolioCompanies: 'Bloom Health Centers, MindPlay',
    status: 'New - Researched',
    lastContacted: '',
    notes: 'Chicago-based, est. $500M-$1.5B AUM. Lower middle market focus on healthcare providers (behavioral health, ambulatory surgery, specialty care), education services, tech-enabled business services. Mission-oriented, growth-focused. Email inferred from pattern. Alt contacts: Justin Marquardt (Partner), Ed Lhee (Partner), John Pircon (Partner).',
    companyInfo: '',
    gumboScore: '9'
  },
  {
    company: 'Bow River Capital',
    notebookLM: '',
    contact: 'Robert Fortier',
    title: 'Managing Director, Private Equity',
    email: 'rfortier@bowrivercapital.com',
    website: 'https://www.bowrivercapital.com',
    linkedin: 'https://www.linkedin.com/company/bow-river-capital',
    sectorFocus: 'Healthcare services, industrials, software',
    portfolioCompanies: '',
    status: 'New - Researched',
    lastContacted: '',
    notes: 'Alternative contact for Bow River Capital. Managing Director role, PE team. Email inferred from pattern.',
    companyInfo: '',
    gumboScore: '8'
  }
];

(async () => {
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  
  // Read current sheet to find next empty row
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:N1000'
  });
  
  const currentRows = res.data.values || [];
  const nextRow = currentRows.length + 1;
  
  console.log(`📊 Current sheet has ${currentRows.length - 1} rows (excluding header)`);
  console.log(`➕ Adding ${newFirms.length} new firms starting at row ${nextRow}\n`);
  
  // Prepare values array
  const values = newFirms.map(firm => [
    firm.company,
    firm.notebookLM,
    firm.contact,
    firm.title,
    firm.email,
    firm.website,
    firm.linkedin,
    firm.sectorFocus,
    firm.portfolioCompanies,
    firm.status,
    firm.lastContacted,
    firm.notes,
    firm.companyInfo,
    firm.gumboScore
  ]);
  
  // Append to sheet
  const updateRes = await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:N',
    valueInputOption: 'RAW',
    requestBody: {
      values: values
    }
  });
  
  console.log('✅ Successfully added firms to sheet!\n');
  console.log('Updated range:', updateRes.data.updates.updatedRange);
  console.log('Rows added:', updateRes.data.updates.updatedRows);
  
  console.log('\n📋 Firms added:');
  newFirms.forEach((firm, idx) => {
    console.log(`\n${idx+1}. ${firm.company}`);
    console.log(`   Contact: ${firm.contact} (${firm.title})`);
    console.log(`   Email: ${firm.email}`);
    console.log(`   Score: ${firm.gumboScore}/10`);
  });
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Verify email patterns using Apollo or direct research');
  console.log('2. Update GitHub dossiers in pe-research/PE-firms/');
  console.log('3. Monitor for upcoming outreach opportunities');
  
})().catch(console.error);
