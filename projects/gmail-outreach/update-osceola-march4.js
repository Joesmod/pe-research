const { google } = require('googleapis');
const key = require('./service-account.json');

async function updateOsceola() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Update Osceola Capital - Row 656
  // Columns: A=Company, B=NotebookLM, C=Contact Name, D=Title, E=Email, F=Website, G=LinkedIn, H=Sector, I=Portfolio, J=Status, K=Notes
  
  const updates = [
    {
      range: 'Sheet1!C656:K656',
      values: [[
        'Kurt Schwab',                                    // C: Contact Name
        'Vice President',                                 // D: Title
        'kschwab@osceola.com',                           // E: Email
        'https://osceola.com',                           // F: Website (update if needed)
        '',                                               // G: LinkedIn (blank)
        '',                                               // H: Sector (keep existing)
        '',                                               // I: Portfolio (keep existing)
        'Enriched',                                       // J: Status
        'Manual research 3/4/26 - verified from osceola.com/team. VP on board of Flotilla Partners, Valor Exterior, Fortify Restoration. Phone: 813-492-5635' // K: Notes
      ]]
    }
  ];
  
  console.log('Updating Osceola Capital (Row 656) with verified contact...');
  
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    resource: {
      valueInputOption: 'RAW',
      data: updates
    }
  });
  
  console.log('✅ Successfully updated Osceola Capital with Kurt Schwab contact info');
  console.log('   Email: kschwab@osceola.com (verified from official website)');
}

updateOsceola().catch(console.error);
