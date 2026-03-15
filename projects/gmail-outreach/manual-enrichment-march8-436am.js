const { google } = require('googleapis');

// Manual enrichment results from web research 2026-03-08 4:36am

const enrichments = [
  {
    row: 832,
    company: 'Anthemis Group',
    contactName: 'Amy Nauiokas',
    title: 'Founder & CEO',
    email: 'amy.nauiokas@anthemis.com',
    website: 'http://www.anthemis.com',
    linkedinUrl: 'https://www.linkedin.com/in/amynauiokas',
    sectorFocus: 'Enriched',
    portfolioCompanies: 'FinTech, InsurTech. Source: ContactOut + official website',
    status: 'Enriched - Web Research 2026-03-08'
  },
  {
    row: 824,
    company: 'Affinity.co',
    contactName: 'Not PE Firm',
    title: '',
    email: '',
    website: '',
    linkedinUrl: '',
    sectorFocus: '',
    portfolioCompanies: 'CRM software for dealmakers. Not a PE/VC firm.',
    status: 'Dead - Software Vendor'
  },
  {
    row: 829,
    company: 'Alkymi',
    contactName: 'Not PE Firm',
    title: '',
    email: '',
    website: '',
    linkedinUrl: '',
    sectorFocus: '',
    portfolioCompanies: 'Data automation software for financial services. Not a PE/VC firm.',
    status: 'Dead - Software Vendor'
  },
  {
    row: 831,
    company: 'Allvue Systems',
    contactName: 'Not PE Firm',
    title: '',
    email: '',
    website: '',
    linkedinUrl: '',
    sectorFocus: '',
    portfolioCompanies: 'Software platform for PE/VC fund management. Services PE but is not PE.',
    status: 'Dead - Software Vendor'
  },
  {
    row: 823,
    company: 'AEC Advisors LLC',
    contactName: 'Not PE Firm',
    title: '',
    email: '',
    website: '',
    linkedinUrl: '',
    sectorFocus: '',
    portfolioCompanies: 'M&A advisory and consulting. Services PE firms but does not invest.',
    status: 'Dead - Advisory Firm'
  }
];

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  console.log('📝 Updating Google Sheet with manual enrichment...\n');
  
  for (const item of enrichments) {
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Sheet1!C${item.row}:J${item.row}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[
            item.contactName,
            item.title,
            item.email,
            item.website,
            item.linkedinUrl,
            item.sectorFocus,
            item.portfolioCompanies,
            item.status
          ]]
        }
      });
      console.log(`✅ Row ${item.row}: ${item.company} → ${item.status}`);
    } catch (error) {
      console.error(`❌ Failed row ${item.row}:`, error.message);
    }
  }
  
  console.log('\n✅ Manual enrichment complete!');
}

updateSheet().catch(console.error);
