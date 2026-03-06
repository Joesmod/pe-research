const { google } = require('googleapis');

async function updateEnrichments() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Second batch of enrichments
  const updates = [
    {
      row: 777, // Palladium Equity Partners
      company: 'Palladium Equity Partners',
      contactName: 'Marcos Rodriguez',
      title: 'Founder, Chairman & CEO',
      email: 'mrodriguez@palladiumequity.com',
      linkedIn: 'https://www.palladiumequity.com/',
      status: 'Enriched',
      notes: 'Official company site. $3B AUM, middle-market PE, NY-based. Multiple sectors.'
    },
    {
      row: 771, // OceanSound Partners
      company: 'OceanSound Partners',
      contactName: 'Ted Coons',
      title: 'Co-Founder & Partner',
      email: 'tcoons@oceansoundpartners.com',
      linkedIn: 'https://oceansoundpartners.com/',
      status: 'Enriched',
      notes: 'Email format: [f][last]@oceansoundpartners.com. NY-based, gov/enterprise tech focus.'
    }
  ];
  
  // Prepare batch update
  const data = updates.map(u => ({
    range: `Sheet1!C${u.row}:I${u.row}`,
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
