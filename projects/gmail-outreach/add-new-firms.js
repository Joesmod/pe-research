const { google } = require('googleapis');

async function addNewFirms() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

  // Get current row count
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:A',
  });
  
  const currentRows = response.data.values.length;
  const startRow = currentRows + 1;
  
  // New PE firms to add
  const newFirms = [
    {
      firm: 'Bregal Partners',
      website: 'https://www.bregal.com',
      contact: 'Tom Perkins',
      email: 'tperkins@bregal.com',
      title: 'Managing Director - Portfolio Services',
      linkedin: 'https://www.linkedin.com/company/bregal-partners',
      status: 'Enriched',
      notes: 'Mid-market PE, $1.25B committed capital, focuses on consumer, food & beverage, and business services. Source: bregal.com + RocketReach'
    },
    {
      firm: 'Gryphon Investors',
      website: 'https://www.gryphon-inv.com',
      contact: 'R. David Andrews',
      email: 'dandrews@gryphon-inv.com',
      title: 'Founder & Co-CEO',
      linkedin: 'https://www.linkedin.com/company/gryphon-investors',
      status: 'Enriched',
      notes: 'Mid-market PE, $1B+ AUM (Fund IV), focuses on business services and growth. Source: gryphon-inv.com team page + inferred email pattern'
    },
    {
      firm: 'Alpine Investors',
      website: 'https://alpineinvestors.com',
      contact: 'Mark Strauch',
      email: 'mark.strauch@alpineinvestors.com',
      title: 'President',
      linkedin: 'https://www.linkedin.com/company/alpine-investors',
      status: 'Enriched',
      notes: 'Mid-market PE, $4.5B+ AUM (Fund IX), focuses on software and services businesses. Source: alpineinvestors.com + BusinessWire press release + inferred email'
    }
  ];
  
  // Prepare rows to append
  const rowsToAdd = newFirms.map(firm => [
    firm.firm,       // Column A - Firm Name
    firm.website,    // Column B - Website
    firm.contact,    // Column C - Contact Name
    firm.email,      // Column D - Email
    firm.title,      // Column E - Title
    firm.linkedin,   // Column F - LinkedIn
    firm.status,     // Column G - Status
    firm.notes       // Column H - Notes
  ]);
  
  // Append to sheet
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Sheet1!A:H',
    valueInputOption: 'RAW',
    requestBody: {
      values: rowsToAdd
    }
  });
  
  console.log(`✅ Added ${newFirms.length} new PE firms to the sheet`);
  console.log(`   Starting at row ${startRow}`);
  newFirms.forEach((firm, idx) => {
    console.log(`   ${startRow + idx}: ${firm.firm} - ${firm.contact} (${firm.title})`);
  });
}

addNewFirms().catch(console.error);
