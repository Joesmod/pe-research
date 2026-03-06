const { google } = require('googleapis');

async function updateEnrichments() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Enrichments to update (row index is 1-based, first row is headers)
  const updates = [
    {
      row: 759, // Long Ridge Partners
      company: 'Long Ridge Equity Partners',
      contactName: 'Jim Brown',
      title: 'Founder & Managing Partner',
      email: 'jbrown@long-ridge.com',
      linkedIn: 'https://long-ridge.com/team/jim-brown/',
      status: 'Enriched',
      notes: 'Official team page. $1.75B AUM, financial/business tech focus. Also Kevin Bhatt (MP): kbhatt@long-ridge.com'
    },
    {
      row: 757, // Kudu Investment Management
      company: 'Kudu Investment Management, LLC',
      contactName: 'Rob Jakacki',
      title: 'Managing Partner, CEO, Co-CIO',
      email: 'rjakacki@kuduinvestment.com',
      linkedIn: 'https://www.kuduinvestment.com/our-team/',
      status: 'Enriched',
      notes: 'Official team page. GP stakes/alternative asset management.'
    },
    {
      row: 764, // Merit Capital Partners
      company: 'Merit Capital Partners',
      contactName: 'Marc Aaronson',
      title: 'Managing Partner (Founder)',
      email: 'maaronson@meritcapital.com',
      linkedIn: 'https://www.meritcapital.com/our-team/',
      status: 'Enriched',
      notes: 'Email format confirmed: [f][last]@meritcapital.com. $2.7B+ AUM, Chicago-based lower middle-market PE.'
    },
    {
      row: 765, // Millennium Bridge Capital
      company: 'Millennium Bridge Capital',
      contactName: 'Brian Knitt',
      title: 'Managing Director',
      email: 'bknitt@mbclp.com',
      linkedIn: 'https://www.millenniumbridge.com/team/',
      status: 'Enriched',
      notes: 'Email format: [f][last]@mbclp.com. Fund-of-funds/co-investment PE, Denver.'
    }
  ];
  
  // Prepare batch update
  const data = updates.map(u => ({
    range: `Sheet1!C${u.row}:I${u.row}`, // Columns C-I: Contact Name, Title, Email, LinkedIn, Status, Notes
    values: [[u.contactName, u.title, u.email, u.linkedIn, u.status, u.notes]]
  }));
  
  const batchUpdateRequest = {
    spreadsheetId,
    resource: {
      valueInputOption: 'RAW',
      data: data
    }
  };
  
  try {
    const result = await sheets.spreadsheets.values.batchUpdate(batchUpdateRequest);
    console.log(JSON.stringify({
      success: true,
      updatedCells: result.data.totalUpdatedCells,
      updatedRows: result.data.totalUpdatedRows,
      firms: updates.map(u => u.company)
    }, null, 2));
  } catch (error) {
    console.error('Error updating sheet:', error.message);
    process.exit(1);
  }
}

updateEnrichments().catch(console.error);
