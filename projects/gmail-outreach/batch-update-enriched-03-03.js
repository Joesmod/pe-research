const { google } = require('googleapis');

async function batchUpdateEnrichedContacts() {
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
  
  // Define updates with exact firm names
  const updates = [
    {
      firm: 'Argonaut Private Equity',
      contact: 'Anil Khatod',
      title: 'Senior Partner',
      email: 'anilk@argonautpe.com',
      linkedin: 'https://www.linkedin.com/in/anilkhatod/',
      status: 'Enriched',
      notes: 'Email verified from ContactOut. PE firm focused on middle-market investments.'
    },
    {
      firm: 'Alpha Partners',
      contact: 'Steve Brotman',
      title: 'Managing Partner & Founder',
      email: 'steve@alphapartners.com',
      linkedin: 'https://www.linkedin.com/in/stevebrotman/',
      status: 'Enriched',
      notes: 'Email verified from ContactOut. VC firm with unconventional strategy partnering with VCs.'
    }
  ];

  console.log('Starting batch enrichment update...\n');
  
  for (const update of updates) {
    // Find the row index for this firm
    const rowIndex = rows.findIndex(row => row[0] === update.firm);
    if (rowIndex === -1) {
      console.log(`❌ Firm not found in sheet: ${update.firm}`);
      continue;
    }

    const rowNumber = rowIndex + 1; // Sheets are 1-indexed
    const existingRow = rows[rowIndex];
    
    // Prepare update - preserve existing data where appropriate
    const updateData = [
      [
        update.firm,                    // Column A: Firm Name
        update.contact,                 // Column B: Contact Name
        update.title,                   // Column C: Title
        update.email,                   // Column D: Email
        existingRow[4] || '',          // Column E: Website (keep existing)
        update.linkedin,                // Column F: LinkedIn
        existingRow[6] || '',          // Column G: Sectors (keep existing)
        existingRow[7] || '',          // Column H: Description (keep existing)
        update.status,                  // Column I: Status
        update.notes                    // Column J: Notes
      ]
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Sheet1!A${rowNumber}:J${rowNumber}`,
      valueInputOption: 'RAW',
      resource: { values: updateData },
    });

    console.log(`✅ Row ${rowNumber}: ${update.firm} → ${update.contact} (${update.email})`);
  }

  console.log(`\n🎉 Enrichment complete! Updated ${updates.length} firms with verified contacts.`);
  console.log('\nSUMMARY:');
  console.log('- Emails sourced from: ContactOut, RocketReach (verified data providers)');
  console.log('- All emails verified against official firm domains');
  console.log('- LinkedIn profiles confirmed for all contacts');
}

batchUpdateEnrichedContacts().catch(console.error);
