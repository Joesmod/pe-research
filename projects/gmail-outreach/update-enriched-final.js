const { google } = require('googleapis');
const key = require('./service-account.json');

async function updateEnrichedLeads() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const updates = [
    // Update Trian with Ed Garden instead of IR email
    {
      range: 'Sheet1!C804:J804',
      values: [[
        'Ed Garden',
        'CEO & Chief Investment Officer',
        'egarden@trianpartners.com',
        'https://trianpartners.com',
        'https://www.linkedin.com/company/trian-partners',
        'Activist Investing, Multi-Industry',
        'Founded 2005 by Nelson Peltz, Peter May, Ed Garden. Multi-billion $ activist investor.',
        'Enriched - 2026-03-09'
      ]]
    },
    // Update Pharos - leave email blank since not verified from published source
    {
      range: 'Sheet1!J991',
      values: [['Apollo search attempted - no verified direct email found - manual research needed - 2026-03-09']]
    },
    // Append Edison Partners as new row
    {
      range: 'Sheet1!A998:J998',
      values: [[
        'Edison Partners',
        'Chris Sugden',
        'Managing Partner',
        'csugden@edisonpartners.com',
        'https://www.edisonpartners.com',
        'https://www.linkedin.com/company/edison-partners',
        'FinTech, Healthcare IT, SaaS',
        'Princeton NJ. 40+ years. Growth equity focused on B2B tech and healthcare. $1B+ AUM.',
        'Enriched - 2026-03-09'
      ]]
    }
  ];
  
  // Execute all updates
  for (const update of updates) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: update.range,
      valueInputOption: 'RAW',
      resource: { values: update.values }
    });
    console.log(`Updated ${update.range}`);
  }
  
  console.log('\nAll leads enriched successfully!');
}

updateEnrichedLeads().catch(console.error);
