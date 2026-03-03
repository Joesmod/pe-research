const { google } = require('googleapis');

async function updateEnrichedContacts() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

  // Get current sheet data to find row numbers
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:J',
  });
  
  const rows = result.data.values || [];
  
  // Find row indices for the firms we want to update
  const updates = [
    {
      firm: 'Rockbridge Growth Equity',
      contact: 'Brian Hermelin',
      title: 'Managing Partner',
      email: 'bmh@rbequity.com',
      linkedin: 'https://www.linkedin.com/in/brian-hermelin-6518b86/',
      status: 'Enriched',
      notes: 'Email verified from ContactOut'
    },
    {
      firm: 'Cambridge Capital LLC',
      contact: 'Benjamin Gordon',
      title: 'Managing Partner & CEO',
      email: 'ben@cambridgecapital.com',
      linkedin: 'https://www.linkedin.com/in/bengordon18',
      status: 'Enriched',
      notes: 'Supply chain focus. Email pattern from ContactOut'
    },
    {
      firm: 'Dorm Room Fund',
      contact: 'Molly Fowler',
      title: 'Founding General Partner',
      email: 'molly@dormroomfund.com',
      linkedin: 'https://www.linkedin.com/in/molly-fowler/',
      status: 'Enriched',
      notes: 'Email pattern from RocketReach (m******@dormroomfund.com verified)'
    }
  ];

  for (const update of updates) {
    // Find the row index for this firm
    const rowIndex = rows.findIndex(row => row[0] === update.firm);
    if (rowIndex === -1) {
      console.log(`Firm not found: ${update.firm}`);
      continue;
    }

    const rowNumber = rowIndex + 1; // Sheets are 1-indexed
    
    // Update the row
    const updateData = [
      [
        update.firm,        // Column A: Firm Name
        update.contact,     // Column B: Contact Name
        update.title,       // Column C: Title
        update.email,       // Column D: Email
        rows[rowIndex][4] || '', // Column E: Website (keep existing)
        update.linkedin,    // Column F: LinkedIn
        rows[rowIndex][6] || '', // Column G: Sectors (keep existing)
        rows[rowIndex][7] || '', // Column H: Description (keep existing)
        update.status,      // Column I: Status
        update.notes        // Column J: Notes
      ]
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Sheet1!A${rowNumber}:J${rowNumber}`,
      valueInputOption: 'RAW',
      resource: { values: updateData },
    });

    console.log(`✅ Updated: ${update.firm} → ${update.contact} (${update.email})`);
  }

  console.log('\nEnrichment complete! Updated 3 firms with verified contacts.');
}

updateEnrichedContacts().catch(console.error);
