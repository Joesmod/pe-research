const { google } = require('googleapis');

async function updateSheet() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
    
    // Updates: [row number, contact name, title, email, linkedin, status, notes]
    const updates = [
      // Jane Ingalls - Bow River Capital (multiple rows with same contact)
      {
        row: 947,
        company: 'Bow River Capital',
        contact: 'Jane Ingalls',
        title: 'President, Chief Operating Officer',
        email: 'ingalls@bowrivercapital.com',
        linkedin: 'https://www.linkedin.com/in/jane-ingalls',
        status: 'Enriched',
        notes: 'Email verified via RocketReach + Bow River team page. Format: [last]@bowrivercapital.com (94.6% standard). President & COO confirmed on official team page.'
      },
      // Eric Bacon - Linsalata Capital Partners
      {
        row: 989,
        company: 'Linsalata Capital Partners',
        contact: 'Eric Bacon',
        title: 'Co-President & Senior Managing Director',
        email: 'ebacon@linsalatacapital.com',
        linkedin: 'https://www.linkedin.com/in/eric-bacon-48411557',
        status: 'Enriched',
        notes: 'Email verified via RocketReach + LinkedIn. Format: {f}{last}@linsalatacapital.com. Co-President & Senior Managing Director (not CFO).'
      }
    ];
    
    console.log('=== UPDATING GOOGLE SHEET ===\n');
    
    for (const update of updates) {
      const range = `Sheet1!C${update.row}:J${update.row}`;
      
      // Column mapping:
      // C = Contact Name
      // D = Title
      // E = Email
      // G = LinkedIn
      // J = Status
      // I = Notes
      
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
      console.log('');
    }
    
    // Handle all other Bow River Capital rows with Jane Ingalls
    const bowRiverRows = [948, 952, 955, 974, 1011, 1018, 1022, 1036, 1045, 1048, 1055, 1070];
    
    console.log('=== UPDATING ADDITIONAL BOW RIVER CAPITAL ROWS ===\n');
    
    for (const rowNum of bowRiverRows) {
      const range = `Sheet1!C${rowNum}:J${rowNum}`;
      
      const values = [
        [
          'Jane Ingalls',
          'President, Chief Operating Officer',
          'ingalls@bowrivercapital.com',
          '',
          'https://www.linkedin.com/in/jane-ingalls',
          '',
          'Email verified via RocketReach + Bow River team page. Format: [last]@bowrivercapital.com (94.6% standard).',
          'Enriched'
        ]
      ];
      
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        resource: { values }
      });
      
      console.log(`✓ Row ${rowNum}: Bow River Capital - Jane Ingalls`);
    }
    
    console.log(`\n=== SUMMARY ===`);
    console.log(`Total rows updated: ${updates.length + bowRiverRows.length}`);
    console.log(`Unique companies enriched: 2`);
    console.log(`  - Bow River Capital (${bowRiverRows.length + 1} rows)`);
    console.log(`  - Linsalata Capital Partners (1 row)`);
    console.log('\nAll updates completed successfully!');
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

updateSheet();
