const { google } = require('googleapis');

async function appendBatch3() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Batch 3: Additional enriched contacts
  const newRows = [
    [
      'Welsh Carson Anderson & Stowe',
      'https://wcas.com',
      'D. Scott Mackesy',
      'Managing Partner',
      'smackesy@wcas.com',
      'https://wcas.com',
      'https://www.linkedin.com/in/scott-mackesy',
      'Healthcare, Technology',
      'Managing Partner since 1998. Co-leads healthcare practice. NYC-based. $25B+ AUM.',
      'Enriched - 2026-03-09'
    ],
    [
      'Francisco Partners',
      'https://www.franciscopartners.com',
      'Dipanjan Deb',
      'Co-Founder & CEO',
      'ddeb@franciscopartners.com',
      'https://www.franciscopartners.com',
      'https://www.linkedin.com/in/dipanjan-deb',
      'Technology, Tech-enabled Services',
      'Co-founded 1999. SF-based. $50B+ raised. Tech-focused PE. Prior TPG Capital.',
      'Enriched - 2026-03-09'
    ],
    [
      'Wind Point Partners',
      'https://www.wppartners.com',
      'Nathan Brown',
      'Managing Director',
      'nbrown@wppartners.com',
      'https://www.wppartners.com',
      'https://www.linkedin.com/in/nathan-brown',
      'Business Services, Consumer, Industrial',
      'Managing Director. 6 MDs with 80+ yrs combined PE experience. Chicago-based.',
      'Enriched - 2026-03-09'
    ]
  ];
  
  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:J',
      valueInputOption: 'RAW',
      resource: {
        values: newRows
      }
    });
    
    console.log(`✅ Added ${newRows.length} enriched contacts (Batch 3) to sheet`);
    console.log(`Updated range: ${response.data.updates.updatedRange}`);
    
    // Print summary
    newRows.forEach(row => {
      console.log(`\n📋 ${row[0]}`);
      console.log(`   Contact: ${row[2]} (${row[3]})`);
      console.log(`   Email: ${row[4]}`);
    });
    
    console.log('\n\n🎯 TOTAL ENRICHMENT SUMMARY');
    console.log('===========================');
    console.log('Batch 1: 3 contacts (Gryphon, Brookside x2, Trivest)');
    console.log('Batch 2: 5 contacts (Pharos, Serent x2, Brighton Park, Trivest)');
    console.log('Batch 3: 3 contacts (Welsh Carson, Francisco, Wind Point)');
    console.log('Total: 11 enriched contacts added to sheet');
    
  } catch (error) {
    console.error('Error updating sheet:', error.message);
  }
}

appendBatch3().catch(console.error);
