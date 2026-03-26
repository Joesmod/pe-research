const { google } = require('googleapis');

async function updateVerifiedContacts() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

  console.log('=== UPDATING VERIFIED CONTACTS ===\n');

  // Verified contacts from manual web research
  const verifiedUpdates = [
    {
      row: 208,
      company: 'Sverica Capital Management',
      contact: 'Jordan Richards',
      title: 'Managing Partner',
      email: 'jordan@sverica.com',
      linkedin: 'https://www.linkedin.com/in/jordan-richards-9514b45',
      source: 'Verified via ContactOut + Sverica.com team page. Email format: first@sverica.com'
    },
    {
      row: 261,
      company: 'RoundTable Healthcare Partners',
      contact: 'Timothy Connors',
      title: 'Managing Partner',
      email: 'tconnors@roundtablehp.com',
      linkedin: 'https://www.linkedin.com/in/timothy-connors-roundtable',
      source: 'Verified via ZoomInfo + Crunchbase. Former CEO of Advantice Health. Email format: [first_initial][last]@roundtablehp.com'
    },
    {
      row: 306,
      company: 'Mountaingate Capital',
      contact: 'Bennett Thompson',
      title: 'Managing Director, Co-Founder',
      email: 'bthompson@mountaingate.com',
      linkedin: 'https://www.linkedin.com/in/bennett-thompson-b780358/',
      source: 'Verified via Success.ai + RocketReach + Mountaingate.com press release. Phone: 303-390-5001'
    }
  ];

  const updates = verifiedUpdates.map(item => ({
    range: `Sheet1!C${item.row}:I${item.row}`,
    values: [[
      item.contact,           // C: Contact Name
      item.title,             // D: Title
      item.email,             // E: Email
      '',                     // F: (preserve existing or leave empty)
      item.linkedin,          // G: LinkedIn
      'Enriched',             // H: Status
      item.source             // I: Notes
    ]]
  }));

  const batchUpdate = await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    resource: {
      valueInputOption: 'RAW',
      data: updates
    }
  });

  console.log(`✅ Updated ${batchUpdate.data.totalUpdatedRows} rows with verified contacts\n`);
  
  verifiedUpdates.forEach(item => {
    console.log(`[Row ${item.row}] ${item.company}`);
    console.log(`  → ${item.contact} | ${item.title}`);
    console.log(`  → ${item.email}`);
    console.log(`  Source: ${item.source}\n`);
  });

  console.log('=== UPDATE COMPLETE ===');
}

updateVerifiedContacts().catch(console.error);
