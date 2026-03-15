const { google } = require('googleapis');

const SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const newFirms = [
  {
    companyName: 'Bow River Capital',
    notebookLM: 'https://www.bowrivercapital.com',
    contactName: 'Blair E. Richardson',
    title: 'CEO & Co-Founder',
    email: 'richardson@bowrivercapital.com',
    website: 'https://www.bowrivercapital.com',
    linkedIn: 'https://www.linkedin.com/company/bow-river-capital',
    sectorFocus: 'Healthcare Services, Industrials, Software Growth Equity',
    portfolioCompanies: '~$2.5B AUM. Denver-based. Healthcare IT, gov tech, field service mgmt. Email verified via ContactOut.',
    status: 'Enriched - Web Research 2026-03-07',
    lastContacted: new Date().toISOString()
  },
  {
    companyName: 'GenNx360 Capital Partners',
    notebookLM: 'https://gennx360.com',
    contactName: 'Monty Yort',
    title: 'Managing Partner',
    email: 'myort@gennx360.com',
    website: 'https://gennx360.com',
    linkedIn: 'https://www.linkedin.com/company/gennx360-management-company-llc',
    sectorFocus: 'Industrial Services, Business Services, Manufacturing',
    portfolioCompanies: '~$2B AUM (est). Greenwich, CT. Diverse-owned. Industrial packaging, commercial services. Email pattern verified via RocketReach.',
    status: 'Enriched - Web Research 2026-03-07',
    lastContacted: new Date().toISOString()
  }
];

async function addFirmsToSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Prepare rows for appending
  const values = newFirms.map(firm => [
    firm.companyName,
    firm.notebookLM,
    firm.contactName,
    firm.title,
    firm.email,
    firm.website,
    firm.linkedIn,
    firm.sectorFocus,
    firm.portfolioCompanies,
    firm.status,
    firm.lastContacted
  ]);
  
  console.log('Adding firms to Sheet1...\n');
  
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Sheet1!A:K',
    valueInputOption: 'USER_ENTERED',
    resource: {
      values
    }
  });
  
  console.log('✅ Successfully added 2 new firms to the sheet:\n');
  newFirms.forEach((firm, idx) => {
    console.log(`${idx + 1}. ${firm.companyName}`);
    console.log(`   Contact: ${firm.contactName} (${firm.title})`);
    console.log(`   Email: ${firm.email}\n`);
  });
  
  console.log('Sheet update complete!');
}

addFirmsToSheet().catch(console.error);
