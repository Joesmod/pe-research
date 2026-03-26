const { google } = require('googleapis');

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

  // Column indices (0-based for arrays, but showing 1-based for clarity)
  // A=0: Company, B=1: NotebookLM, C=2: Contact, D=3: Title, E=4: Email
  // F=5: ?, G=6: LinkedIn, H=7: Status, I=8: Notes

  const updates = [
    {
      row: 924, // Wynnchurch Capital
      company: 'Wynnchurch Capital',
      contact: 'John Hatherly',
      title: 'Managing Partner',
      email: 'jhatherly@wynnchurch.com',
      linkedin: 'https://www.linkedin.com/in/john-hatherly-4b772112/',
      status: 'Enriched',
      notes: 'Email verified from official Wynnchurch press release (wynnchurch.com/news/wynnchurch-capital-announces-executive-promotions). Founder & Managing Partner. (Enriched 2026-03-15 cron)'
    }
  ];

  console.log('Updating Google Sheet...\n');

  for (const update of updates) {
    console.log(`Updating row ${update.row}: ${update.company}`);
    
    // Update columns C (contact), D (title), E (email), G (linkedin), H (status), I (notes)
    const range = `Sheet1!C${update.row}:I${update.row}`;
    const values = [[
      update.contact,      // C: Contact Name
      update.title,        // D: Title
      update.email,        // E: Email
      '',                  // F: (skip)
      update.linkedin,     // G: LinkedIn
      update.status,       // H: Status
      update.notes         // I: Notes
    ]];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      resource: { values }
    });

    console.log(`   ✅ Updated`);
  }

  console.log('\n✅ Sheet updates complete!');
  console.log('\nSUMMARY:');
  console.log(`- Enriched: ${updates.length} firms`);
  console.log(`- Verified emails found: ${updates.length}`);
}

updateSheet().catch(console.error);
