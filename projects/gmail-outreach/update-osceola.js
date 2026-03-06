const { google } = require('googleapis');
const key = require('./service-account.json');

const SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function updateOsceola() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth });

  // Read current sheet to find Osceola row
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Sheet1!A:J'
  });

  const rows = result.data.values;
  let osceolaIndex = -1;

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] && rows[i][0].includes('Osceola')) {
      osceolaIndex = i;
      break;
    }
  }

  if (osceolaIndex === -1) {
    console.log('Osceola Capital not found in sheet');
    return;
  }

  console.log(`Found Osceola Capital at row ${osceolaIndex + 1}`);

  // Update with verified contact info
  const updates = [{
    range: `Sheet1!C${osceolaIndex + 1}:G${osceolaIndex + 1}`,
    values: [[
      'Michael Babb',
      'Managing Partner',
      'mbabb@osceola.com',
      'https://osceola.com',
      'https://www.linkedin.com/company/osceola-capital-management'
    ]]
  }];

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      valueInputOption: 'RAW',
      data: updates
    }
  });

  console.log('✅ Updated Osceola Capital with verified contact:');
  console.log('   Contact: Michael Babb');
  console.log('   Title: Managing Partner');
  console.log('   Email: mbabb@osceola.com');
  console.log('   Source: Official Osceola PDF');
}

updateOsceola().catch(console.error);
