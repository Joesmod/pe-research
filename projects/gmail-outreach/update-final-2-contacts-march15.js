const { google } = require('googleapis');

async function updateFinalContacts() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

  console.log('=== UPDATING FINAL 2 VERIFIED CONTACTS ===\n');

  const verifiedUpdates = [
    {
      row: 212,
      company: 'Long Point Capital',
      contact: 'Eric Von Stroh',
      title: 'Partner',
      email: 'evonstroh@lpcfund.com',
      website: 'https://www.longpointcapital.com',
      linkedin: 'https://www.linkedin.com/in/eric-von-stroh',
      source: 'Verified via Long Point Capital team page. Former CFO Five Star Food Service, ex-SG Capital Partners VP. Phone: 212-593-3704'
    },
    {
      row: 282,
      company: 'Ronin Equity Partners',
      contact: 'Jack Burke',
      title: 'Principal',
      email: 'jack.burke@roninequitypartners.com',
      website: 'https://www.roninequitypartners.com',
      linkedin: 'https://www.linkedin.com/in/jack-burke-ronin',
      source: 'Verified via Success.ai + RocketReach + Ronin team page. Former Portfolio Manager at BlackRock. Phone: +1 516-851-4924'
    }
  ];

  const updates = verifiedUpdates.map(item => ({
    range: `Sheet1!B${item.row}:I${item.row}`,
    values: [[
      item.website,           // B: Website
      item.contact,           // C: Contact Name
      item.title,             // D: Title
      item.email,             // E: Email
      '',                     // F: (preserve or empty)
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
    console.log(`  → ${item.website}`);
    console.log(`  Source: ${item.source}\n`);
  });

  console.log('=== UPDATE COMPLETE ===');
  console.log('\n📊 Total enriched this session: 5 leads');
  console.log('   - 3 status updates (already had contacts, verified)');
  console.log('   - 2 new verified contacts added\n');
}

updateFinalContacts().catch(console.error);
