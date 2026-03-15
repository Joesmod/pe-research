const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_KEY = path.join(__dirname, 'service-account.json');

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Read enrichment data
  const enrichments = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'enrichment-march13-737am.json'), 'utf8')
  );

  console.log(`Updating ${enrichments.length} rows with enriched data...\n`);

  for (const enrichment of enrichments) {
    const { row, contactName, title, email, linkedIn, source, status } = enrichment;

    // Column mapping: C=Contact Name, D=Title, E=Email, G=LinkedIn, J=Status
    const updates = [
      {
        range: `Sheet1!C${row}`,
        values: [[contactName]],
      },
      {
        range: `Sheet1!D${row}`,
        values: [[title]],
      },
      {
        range: `Sheet1!E${row}`,
        values: [[email]],
      },
      {
        range: `Sheet1!G${row}`,
        values: [[linkedIn]],
      },
      {
        range: `Sheet1!J${row}`,
        values: [[status]],
      },
      {
        range: `Sheet1!K${row}`, // Notes column
        values: [[`Source: ${source}`]],
      },
    ];

    for (const update of updates) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: update.range,
        valueInputOption: 'RAW',
        requestBody: {
          values: update.values,
        },
      });
    }

    console.log(`✅ Updated row ${row}: ${contactName} - ${email}`);
  }

  console.log(`\n✅ Successfully updated ${enrichments.length} rows!`);
}

updateSheet().catch(console.error);
