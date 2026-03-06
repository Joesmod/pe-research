const { google } = require('googleapis');

async function updateChristopherLee() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Row 374: Christopher Lee - Infinity Capital Partners
  const row374 = {
    range: 'Sheet1!B374:J374',
    values: [[
      'Christopher Lee',
      'Co-Founder and Managing Partner',
      'clee@infinitycappartners.com',
      'http://www.infinitycappartners.com',
      'https://www.linkedin.com/company/infinitycapitalpartners',
      'Business Services, Media & Entertainment',
      'M&A advisory, middle-market investment banking',
      'Enriched',
      new Date().toISOString()
    ]]
  };
  
  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: row374.range,
      valueInputOption: 'USER_ENTERED',
      resource: { values: row374.values }
    });
    console.log('✓ Updated row 374: Christopher Lee @ Infinity Capital Partners');
    console.log('\n✅ Enrichment complete');
    console.log('Christopher Lee - clee@infinitycappartners.com (Co-Founder & Managing Partner)');
    console.log('Phone: 405-464-5962');
    
  } catch (error) {
    console.error('Error updating sheet:', error);
  }
}

updateChristopherLee();
