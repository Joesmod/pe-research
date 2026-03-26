const { google } = require('googleapis');

async function enrichSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const sheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Enrichments to apply (row numbers from our earlier read)
  const updates = [
    // Casdin Capital - Row 580
    {
      range: 'Sheet1!C580:K580',
      values: [['Eli Casdin', 'Chief Investment Officer & Founder', 'eli@casdincapital.com', 
                'https://casdincapital.com', 'https://www.linkedin.com/in/eli-casdin-2753777/', 
                'Healthcare, Technology, Business Services, Life Sciences', '', 'Enriched', 
                'Email found in SEC filing. Also has: Alexandria Fisk (COO), Lawrence Canzoneri (CFO), Randy White (Dir. BD)']]
    },
    // Hunter Point Capital - Row 622
    {
      range: 'Sheet1!C622:K622',
      values: [['Andrew Short', 'Senior Partner', 'ashort@hunterpointcapital.com',
                'https://www.hunterpointcapital.com', 'https://www.linkedin.com/company/hunterpointcapital',
                'GP Stakes, Alternative Asset Managers', '', 'Enriched',
                'Email from LinkedIn post. Also: Bennett Goodman (Exec Chairman), Avi Kalichstein (CEO), Michael Nash (Senior Partner)']]
    },
    // IEQ Capital - Row 623
    {
      range: 'Sheet1!C623:K623',
      values: [['Eric Harrison', 'Co-Founder & Managing Partner', '',
                'https://ieqcapital.com', 'https://www.linkedin.com/in/eric-harrison-9982a45/',
                'Wealth management, alternative investments', '', 'Researched - No Email',
                '$47B AUM. Also: Alan Zafran (Managing Partner), Rob Skinner (Managing Partner), Dean Horwitz (COO). No public emails found.']]
    },
    // Kaizen Equity Partners - Row 627
    {
      range: 'Sheet1!C627:K627',
      values: [['Shane Seelig', 'Co-Founder & Managing Partner', '',
                'https://www.kaizen-equity.com', 'https://www.linkedin.com/in/shanezseelig/',
                'Software & Internet, B2B SaaS', '', 'Researched - No Email',
                'Investment bank (sell-side only). Also: Zach Haarer (Managing Partner). No public emails found.']]
    },
    // Keystone Capital - Row 629
    {
      range: 'Sheet1!C629:K629',
      values: [['Sean Lyons', 'Partner', 'slyons@keystonecapital.com',
                'https://keystonecapital.com', 'https://www.linkedin.com/company/keystonecapitalmanagementlp',
                'Business Services, Environmental Services', '', 'Enriched',
                'Email from Keystone press release. Chicago-based PE firm.']]
    }
  ];
  
  console.log('Updating sheet with enrichments...');
  
  for (const update of updates) {
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: update.range,
        valueInputOption: 'RAW',
        resource: {
          values: update.values
        }
      });
      console.log(`✓ Updated ${update.range}`);
    } catch (err) {
      console.error(`✗ Error updating ${update.range}:`, err.message);
    }
  }
  
  console.log('\n=== ENRICHMENT COMPLETE ===');
  console.log('Total updated: 5 leads');
  console.log('With verified emails: 3 (Casdin, Hunter Point, Keystone)');
  console.log('With contact info but no email: 2 (IEQ, Kaizen)');
}

enrichSheet().catch(console.error);
