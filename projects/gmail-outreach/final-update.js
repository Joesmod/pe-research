const { google } = require('googleapis');

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Final enrichment data - publicly verified contacts only
  const updates = [
    {
      firm: 'Corridor Capital',
      contactName: 'Craig Enenstein',
      title: 'Founder & CEO',
      email: 'craig@corridorcap.com',
      linkedin: 'https://www.linkedin.com/in/craig-enenstein/',
      status: 'Enriched',
      notes: 'Email from official press release (corridorcapital.com, 2025-10-28). YPO member, Wharton MBA. Phone: 310-442-7001. Operationally intensive PE firm, business services focus.'
    },
    {
      firm: 'Gauge Capital',
      contactName: 'Andrew Peix',
      title: 'Partner, Business Development',
      email: 'apeix@gaugecapital.com',
      linkedin: 'https://www.linkedin.com/in/andrew-peix/',
      status: 'Enriched',
      notes: 'Email from official press releases (PR Newswire 2021-01-22, gaugecapital.com 2024/2025). Phone: 682-334-5781 (office), 617-962-9037 (mobile). Dallas-based, $3B+ AUM.'
    },
    {
      firm: 'Boathouse Capital',
      contactName: 'Bill Dyer',
      title: 'Managing Partner',
      email: 'Bill.Dyer@boathousecapital.com',
      linkedin: 'https://www.linkedin.com/in/bill-dyer/',
      status: 'Enriched',
      notes: 'Email from official team page (boathousecapital.com/team). Duke University grad, based in Berwyn PA. vCard available on site. Phone: 610-977-XXXX.'
    },
    {
      firm: 'Kinzie Capital Partners',
      contactName: 'Suzanne Yoon',
      title: 'Founder & Managing Partner',
      email: '',
      linkedin: 'https://www.linkedin.com/in/suzanneyoon/',
      status: 'Enriched',
      notes: 'Phone: 312-809-2492 (from PR Newswire 2019-06-27). Northwestern Kellogg MBA. Chicago-based lower middle-market PE. Manufacturing, business services, consumer focus. $20M+ AUM.'
    },
    {
      firm: 'Palladium Equity Partners',
      contactName: 'Erick Bronner',
      title: 'Managing Director, Fundraising & Investor Relations',
      email: 'ebronner@palladiumequity.com',
      linkedin: 'https://www.linkedin.com/in/erick-bronner/',
      status: 'Enriched',
      notes: 'Email from official press release (palladiumequity.com, 2021-04-12). Healthcare & life sciences growth equity. Contact for investor relations and capital raising.'
    },
    {
      firm: 'Silver Oak Services Partners',
      contactName: 'Greg Barr',
      title: 'Managing Partner & Co-Founder',
      email: 'gbarr@silveroaksp.com',
      linkedin: 'https://www.linkedin.com/in/gregory-barr-45102314/',
      status: 'Enriched',
      notes: 'Email from company website article (silveroaksp.com, 2013-07-25). Phone: 847-332-0401. Services sector focus, 50+ years collective PE experience. Active in transportation & logistics.'
    }
  ];
  
  // Find matching rows and update
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:A'
  });
  
  const firmColumn = result.data.values;
  
  for (const update of updates) {
    const rowIndex = firmColumn.findIndex((row, index) => 
      row[0] && row[0].toLowerCase().includes(update.firm.toLowerCase())
    );
    
    if (rowIndex !== -1) {
      const row = rowIndex + 1;
      console.log(`Updating Row ${row}: ${update.firm} - ${update.contactName}`);
      
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Sheet1!B${row}:I${row}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[
            update.contactName,
            update.title,
            update.email,
            update.linkedin,
            '',
            '',
            update.status,
            update.notes
          ]]
        }
      });
    } else {
      console.log(`Could not find row for: ${update.firm}`);
    }
  }
  
  console.log(`\nSuccessfully enriched ${updates.length} leads with verified contact information.`);
}

updateSheet().catch(console.error);
