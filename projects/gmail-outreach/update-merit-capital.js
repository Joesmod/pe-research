const { google } = require('googleapis');

async function updateSheet() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
    
    const update = {
      row: 764,
      company: 'Merit Capital Partners',
      contact: 'Evan Gallinson',
      title: 'Managing Director',
      email: 'egallinson@meritcapital.com',
      linkedin: 'https://www.linkedin.com/in/evan-gallinson-7002307',
      status: 'Enriched',
      notes: 'Email verified via RocketReach + Apollo.io. Format: {f}{last}@meritcapital.com (100% standard per RocketReach). Managing Director confirmed via LinkedIn, Bloomberg, ZoomInfo.'
    };
    
    console.log('=== UPDATING MERIT CAPITAL PARTNERS ===\n');
    
    const range = `Sheet1!C${update.row}:J${update.row}`;
    
    const values = [
      [
        update.contact,      // C: Contact Name
        update.title,        // D: Title
        update.email,        // E: Email
        '',                  // F: (skip)
        update.linkedin,     // G: LinkedIn
        '',                  // H: (skip)
        update.notes,        // I: Notes
        update.status        // J: Status
      ]
    ];
    
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      resource: { values }
    });
    
    console.log(`✓ Row ${update.row}: ${update.company} - ${update.contact}`);
    console.log(`  Email: ${update.email}`);
    console.log(`  Title: ${update.title}`);
    console.log(`  Status: ${update.status}`);
    console.log('\nUpdate completed successfully!');
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

updateSheet();
