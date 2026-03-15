const { google } = require('googleapis');

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Get current data to find row numbers
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:J'
  });
  
  const rows = response.data.values;
  
  // Final batch - more partial enrichments
  const updates = [
    {
      company: 'Juggernaut Capital Partners',
      contactName: 'John Shulman',
      title: 'Managing Partner',
      email: '',
      linkedIn: 'https://www.linkedin.com/in/john-shulman-52295319/',
      status: 'Partial',
      notes: 'Managing Partner confirmed via LinkedIn - no published direct email found - 2026-03-08'
    },
    {
      company: 'Gauge Capital',
      contactName: 'Tom McKelvey',
      title: 'Co-Founder and Managing Partner/CEO',
      email: '',
      linkedIn: 'https://www.linkedin.com/in/tom-mckelvey-4085666/',
      status: 'Partial',
      notes: 'Co-Founder & Managing Partner/CEO confirmed via LinkedIn - no published direct email found - 2026-03-08'
    },
    {
      company: 'Camden Partners',
      contactName: 'Jason Tagler',
      title: 'Managing Partner',
      email: '',
      linkedIn: 'https://www.linkedin.com/in/jason-tagler-1327bb4/',
      status: 'Partial',
      notes: 'Managing Partner confirmed via LinkedIn - no published direct email found - 2026-03-08'
    }
  ];
  
  // Find and update each company
  for (const update of updates) {
    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === update.company) {
        rowIndex = i + 1; // Sheets are 1-indexed
        break;
      }
    }
    
    if (rowIndex === -1) {
      console.log(`Company not found: ${update.company}`);
      continue;
    }
    
    // Update the row (columns C=ContactName, D=Title, E=Email, F=LinkedIn, G=Status, H=Notes)
    const updateRange = `Sheet1!C${rowIndex}:J${rowIndex}`;
    const values = [[
      update.contactName || '',
      update.title || '',
      update.email || '',
      update.linkedIn || '',
      update.status || '',
      update.notes || ''
    ]];
    
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: updateRange,
      valueInputOption: 'USER_ENTERED',
      resource: { values }
    });
    
    console.log(`✓ Updated: ${update.company} - ${update.contactName}`);
  }
  
  console.log('\n✓ Batch update 3 complete!');
  console.log(`Total in this batch: ${updates.length} leads`);
}

updateSheet().catch(console.error);
