const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const credentials = JSON.parse(fs.readFileSync('service-account.json', 'utf8'));

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

async function updateSheet() {
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  
  // Avista Healthcare Partners - Row 713
  const updates = [
    {
      range: 'Sheet1!C713', // Contact Name
      values: [['David Burgstahler']]
    },
    {
      range: 'Sheet1!D713', // Title
      values: [['Managing Partner & CEO']]
    },
    {
      range: 'Sheet1!E713', // Email
      values: [['burgstahler@avistacap.com']]
    },
    {
      range: 'Sheet1!G713', // LinkedIn
      values: [['https://www.linkedin.com/in/david-burgstahler-a9837168/']]
    },
    {
      range: 'Sheet1!J713', // Status
      values: [['Enriched']]
    },
    {
      range: 'Sheet1!K713', // Last Contacted
      values: [['2026-03-06 (enriched)']]
    },
    {
      range: 'Sheet1!L713', // Notes
      values: [['Verified via ContactOut. Co-founded Avista in 2005. Former Partner at DLJ Merchant Banking. Email domain: @avistacap.com. Source: https://contactout.com/david-burgstahler-25927 [Enriched: 2026-03-06 cron]']]
    }
  ];
  
  // Execute updates
  for (const update of updates) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: update.range,
      valueInputOption: 'RAW',
      resource: {
        values: update.values
      }
    });
    console.log(`Updated ${update.range}`);
  }
  
  console.log('\n✅ Avista Healthcare Partners enriched successfully!');
  console.log('Contact: David Burgstahler (Managing Partner & CEO)');
  console.log('Email: burgstahler@avistacap.com');
  console.log('LinkedIn: https://www.linkedin.com/in/david-burgstahler-a9837168/');
}

updateSheet().catch(console.error);
