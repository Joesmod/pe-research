const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = 'service-account.json';

// New firms to add
const newFirms = [
  {
    companyName: 'Bow River Capital',
    notebookLM: 'https://www.bowrivercapital.com',
    contactName: 'Greg J. Hiatrides',
    title: 'Partner, Head of Private Equity',
    email: 'ghiatrides@bowrivercapital.com',
    website: 'https://www.bowrivercapital.com',
    linkedin: 'https://www.bowrivercapital.com/team',
    sectorFocus: 'Healthcare services, industrial services, infrastructure, tech-enabled business services',
    portfolioCompanies: 'Progressive Roofing, Amazing Care, NextEdge, Veregy, RailPros',
    status: 'Enriched',
    lastContacted: '',
    notes: 'Mid-market PE, $2.5B+ AUM. Raised $590M for Fund III (2023). Denver-based. Focus on services roll-ups and value creation. Email pattern inferred. Enriched 2026-03-07.',
    companyInfoUrl: 'https://www.bowrivercapital.com/private-equity'
  }
];

async function appendNewFirms() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  console.log(`\n📝 ADDING NEW PE FIRMS TO SHEET`);
  console.log(`Sheet ID: ${SHEET_ID}\n`);
  
  const values = newFirms.map(firm => [
    firm.companyName,
    firm.notebookLM,
    firm.contactName,
    firm.title,
    firm.email,
    firm.website,
    firm.linkedin,
    firm.sectorFocus,
    firm.portfolioCompanies,
    firm.status,
    firm.lastContacted,
    firm.notes,
    firm.companyInfoUrl
  ]);
  
  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:M',
      valueInputOption: 'RAW',
      requestBody: { values }
    });
    
    console.log(`✅ Added ${newFirms.length} new firm(s):`);
    newFirms.forEach(firm => {
      console.log(`\n   • ${firm.companyName}`);
      console.log(`     Contact: ${firm.contactName} (${firm.title})`);
      console.log(`     Email: ${firm.email}`);
      console.log(`     Focus: ${firm.sectorFocus}`);
    });
    
    console.log(`\n🎯 Update Range: ${response.data.updates.updatedRange}`);
  } catch (error) {
    console.error(`❌ Error adding firms:`, error.message);
  }
}

appendNewFirms().catch(console.error);
