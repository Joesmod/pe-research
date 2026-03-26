const { google } = require('googleapis');

async function addResearchNotes() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

  // Add notes for firms researched but no verified email found
  const researchNotes = [
    {
      row: 766,
      company: 'Newflow Partners',
      notes: 'Researched 2026-03-15 cron: Jason Levine (Managing Partner) confirmed via newflow.partners/team but no email published. Apollo API returned no verified contacts. Further research needed.'
    },
    {
      row: 864,
      company: 'Accel-KKR',
      notes: 'Researched 2026-03-15 cron: Tom Barnds (Co-Managing Partner) confirmed via accel-kkr.com/team but no email published. RocketReach shows pattern t******@accel-kkr.com but NOT VERIFIED. Apollo API returned no verified contacts.'
    },
    {
      row: 937,
      company: 'The Riverside Company',
      notes: 'Researched 2026-03-15 cron: Stewart Kohl (Co-CEO) confirmed via riversidecompany.com but no email published. Apollo API returned no verified contacts. $14B AUM, 350+ employees.'
    },
    {
      row: 993,
      company: 'Gryphon Investors',
      notes: 'Researched 2026-03-15 cron: R. David Andrews (Founder & Co-CEO) confirmed via gryphon-inv.com but no email published. Apollo API returned no verified contacts. Founded 1995.'
    },
    {
      row: 994,
      company: 'Trivest Partners',
      notes: 'Researched 2026-03-15 cron: Forest Wester (Managing Partner, Mid-Market Fund) confirmed via trivest.com. ContactOut shows partial ******@trivest.com but NOT VERIFIED. Apollo API returned no verified contacts. Currently has generic info@trivest.com.'
    }
  ];

  console.log('Adding research notes to Google Sheet...\n');

  for (const note of researchNotes) {
    console.log(`Adding note to row ${note.row}: ${note.company}`);
    
    // Update column I (notes) - append to existing notes
    const range = `Sheet1!I${note.row}`;
    
    // First, read existing notes
    const readResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range
    });
    
    const existingNotes = (readResponse.data.values && readResponse.data.values[0] && readResponse.data.values[0][0]) || '';
    const updatedNotes = existingNotes ? `${existingNotes} | ${note.notes}` : note.notes;
    
    // Update with combined notes
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      resource: { values: [[updatedNotes]] }
    });

    console.log(`   ✅ Added`);
  }

  console.log('\n✅ Research notes added!');
}

addResearchNotes().catch(console.error);
