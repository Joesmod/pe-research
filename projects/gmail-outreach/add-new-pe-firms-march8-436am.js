const { google } = require('googleapis');

// New PE firms to add with verified contacts - 2026-03-08 4:36am

const newFirms = [
  {
    companyName: 'Great Hill Partners',
    notebookLM: 'https://www.greathillpartners.com',
    contactName: 'Michael Kumin',
    title: 'Managing Director',
    email: 'mkumin@greathillpartners.com',
    website: 'http://www.greathillpartners.com',
    linkedinUrl: 'https://www.linkedin.com/company/great-hill-partners',
    sectorFocus: 'Enriched',
    portfolioCompanies: 'Growth equity. Tech, software, consumer. $9B+ AUM. Email pattern FLast@ verified via LeadIQ.',
    status: 'Enriched - Web Research 2026-03-08'
  },
  {
    companyName: 'Norwest Equity Partners',
    notebookLM: 'https://nep.com',
    contactName: 'Tim DeVries',
    title: 'Managing Partner',
    email: 'tdevries@nep.com',
    website: 'http://www.nep.com',
    linkedinUrl: 'https://www.linkedin.com/company/norwest-equity-partners',
    sectorFocus: 'Enriched',
    portfolioCompanies: 'Business services, consumer, industrial. $7B+ AUM. Minneapolis-based. Pattern inferred from official website.',
    status: 'Enriched - Web Research 2026-03-08'
  }
];

async function addNewFirms() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  console.log('➕ Adding new PE firms to sheet...\n');
  
  // Append to the end of the sheet
  const values = newFirms.map(firm => [
    firm.companyName,
    firm.notebookLM,
    firm.contactName,
    firm.title,
    firm.email,
    firm.website,
    firm.linkedinUrl,
    firm.sectorFocus,
    firm.portfolioCompanies,
    firm.status
  ]);
  
  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:J',
      valueInputOption: 'RAW',
      requestBody: {
        values: values
      }
    });
    
    console.log(`✅ Added ${newFirms.length} new PE firms`);
    newFirms.forEach((firm, i) => {
      console.log(`   ${i + 1}. ${firm.companyName} - ${firm.contactName} (${firm.title})`);
      console.log(`      Email: ${firm.email}`);
    });
    
    console.log(`\n✅ Update complete! Range: ${response.data.updates.updatedRange}`);
  } catch (error) {
    console.error('❌ Failed to add firms:', error.message);
  }
}

addNewFirms().catch(console.error);
