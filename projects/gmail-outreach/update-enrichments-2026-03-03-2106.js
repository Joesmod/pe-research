const { google } = require('googleapis');

async function updateEnrichments() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Row 368: Michael Booth - Calvert Street Investment Partners
  const row368 = {
    range: 'Sheet1!B368:J368',
    values: [[
      'Michael Booth',
      'Partner and Chief Investment Officer',
      'mbooth@crescentia.calvertst.com',
      'http://www.calvertstreetinvestmentpartners.com',
      'http://www.linkedin.com/in/michael-booth-4128abb3',
      '', // Sector Focus (keep existing or blank)
      '', // Portfolio Companies (keep existing or blank)
      'Enriched',
      new Date().toISOString()
    ]]
  };
  
  // Row 329: Jeff Carlson - Pritzker Group Private Capital
  const row329 = {
    range: 'Sheet1!B329:J329',
    values: [[
      'Jeff Carlson',
      'Head of Technology',
      'jcarlson@ppcpartners.com',
      'https://www.ppcpartners.com',
      'https://www.linkedin.com/in/jeffcarlson2',
      'Business services, healthcare, consumer, industrial',
      '', // Portfolio Companies (keep existing)
      'Enriched',
      new Date().toISOString()
    ]]
  };
  
  try {
    // Update row 368
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: row368.range,
      valueInputOption: 'USER_ENTERED',
      resource: { values: row368.values }
    });
    console.log('✓ Updated row 368: Michael Booth @ Calvert Street');
    
    // Update row 329
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: row329.range,
      valueInputOption: 'USER_ENTERED',
      resource: { values: row329.values }
    });
    console.log('✓ Updated row 329: Jeff Carlson @ Pritzker Group PPC');
    
    console.log('\n✅ Successfully enriched 2 leads');
    console.log('\nDetails:');
    console.log('1. Michael Booth - mbooth@crescentia.calvertst.com (Partner & CIO, Calvert Street)');
    console.log('2. Jeff Carlson - jcarlson@ppcpartners.com (Head of Technology, PPC)');
    
  } catch (error) {
    console.error('Error updating sheet:', error);
  }
}

updateEnrichments();
