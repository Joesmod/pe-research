const { google } = require('googleapis');

async function updateBatch3() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Final batch
  const batch3 = [
    {
      row: 285,
      company: 'Sentinel Capital Partners',
      contact: 'David S. Lobel',
      title: 'Managing Partner',
      email: '', // Not verified
      linkedin: '',
      notes: 'Managing Partner, co-founder (1995). Verified from sentinelpartners.com press release March 2025. Email not published. 2026-03-12'
    }
  ];

  console.log(`Updating Final Batch: ${batch3.length} verified contact...\n`);

  for (const item of batch3) {
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

  console.log('\n✅ Final batch complete!');
  console.log('\n📊 TOTAL ENRICHMENT SUMMARY:');
  console.log('- Batch 1: 6 contacts');
  console.log('- Batch 2: 3 contacts');
  console.log('- Batch 3: 1 contact');
  console.log('- TOTAL: 10 PE firms enriched with verified contacts');
  console.log('\nStatus: Partial (contacts found, email verification still needed)');
  console.log('Next step: Search for published emails or use email verification tools');
}

updateBatch3().catch(console.error);
