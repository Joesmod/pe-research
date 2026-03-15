const { google } = require('googleapis');

async function updateBatch2() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Second batch of verified contacts
  const batch2 = [
    {
      row: 851,
      company: 'Wynnchurch Capital',
      contact: 'Greg Gleason',
      title: 'Managing Partner',
      email: '', // Not verified
      linkedin: 'https://www.linkedin.com/in/greg-gleason-5468848/',
      notes: 'Managing Partner, oversees management and investment activities. Joined 2008. Verified from wynnchurch.com/team and LinkedIn. Email not published. 2026-03-12'
    },
    {
      row: 864,
      company: 'Accel-KKR',
      contact: 'Tom Barnds',
      title: 'Co-Managing Partner',
      email: '', // Not verified
      linkedin: 'https://www.linkedin.com/in/tom-barnds-6083525',
      notes: 'Co-Managing Partner. Verified from accel-kkr.com press releases and team page. Email not published. 2026-03-12'
    },
    {
      row: 1009,
      company: 'Accel-KKR',
      contact: 'Rob Palumbo',
      title: 'Co-Managing Partner',
      email: '', // Not verified
      linkedin: '',
      notes: 'Co-Managing Partner. Verified from accel-kkr.com press releases. Email not published. 2026-03-12'
    }
  ];

  console.log(`Updating Batch 2: ${batch2.length} verified contacts...\n`);

  for (const item of batch2) {
    try {
      const range = `Sheet1!C${item.row}:K${item.row}`;
      
      const currentData = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `Sheet1!A${item.row}:K${item.row}`
      });
      
      const currentRow = currentData.data.values ? currentData.data.values[0] : [];
      
      const values = [[
        item.contact,
        item.title,
        item.email || '',
        currentRow[5] || '',
        item.linkedin,
        currentRow[7] || '',
        currentRow[8] || '',
        'Partial',
        item.notes
      ]];

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        resource: { values }
      });

      console.log(`✓ Row ${item.row}: ${item.company} - ${item.contact} (${item.title})`);
    } catch (error) {
      console.error(`✗ Row ${item.row}: ${item.company} - ${error.message}`);
    }
  }

  console.log('\n✅ Batch 2 complete!');
}

updateBatch2().catch(console.error);
