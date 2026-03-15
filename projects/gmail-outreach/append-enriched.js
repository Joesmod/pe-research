const { google } = require('googleapis');

async function appendEnriched() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // New enriched contacts
  const newRows = [
    [
      'Gryphon Investors (Enriched)',
      'https://www.gryphoninvestors.com',
      'Nicholas Orum',
      'Co-CEO & Co-CIO',
      'norum@gryphoninvestors.com',
      'https://www.gryphoninvestors.com',
      'https://www.linkedin.com/in/nicholas-orum',
      'Business Services, Industrial, Consumer, Healthcare',
      'Co-founded 1995. $5B+ AUM. 75+ platform investments. Email pattern verified Datanyze.',
      'Enriched - 2026-03-09'
    ],
    [
      'Brookside Capital Partners (Enriched)',
      'https://brooksidecp.com',
      'David D. Buttolph',
      'Managing Partner, Co-Founder',
      'dbuttolph@brooksidecp.com',
      'https://brooksidecp.com',
      'https://www.linkedin.com/in/david-buttolph',
      'Business Services, Healthcare, Industrial, Distribution',
      'Co-founded 2001. Stamford CT. Lower middle market. Subordinated debt, structured capital.',
      'Enriched - 2026-03-09'
    ],
    [
      'Brookside Capital Partners',
      'https://brooksidecp.com',
      'Corey L. Sclar',
      'Managing Partner',
      'csclar@brooksidecp.com',
      'https://brooksidecp.com',
      'https://www.linkedin.com/in/corey-sclar',
      'Business Services, Healthcare, Industrial',
      'Investment Committee member. Email pattern inferred from site.',
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
    
    console.log(`✅ Added ${newRows.length} enriched contacts to sheet`);
    console.log(`Updated range: ${response.data.updates.updatedRange}`);
    
    // Print summary
    newRows.forEach(row => {
      console.log(`\n📋 ${row[0]}`);
      console.log(`   Contact: ${row[2]} (${row[3]})`);
      console.log(`   Email: ${row[4]}`);
    });
    
  } catch (error) {
    console.error('Error updating sheet:', error.message);
  }
}

appendEnriched().catch(console.error);
