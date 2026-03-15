const { google } = require('googleapis');
const fs = require('fs');

async function addNewFirms() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

    // Read new firms from JSON
    const newFirms = JSON.parse(fs.readFileSync('new-firms-march10-136am.json', 'utf8'));

    console.log(`Adding ${newFirms.length} new firms to the sheet...\n`);

    // Build rows to append (matching columns A-J)
    const rows = newFirms.map(firm => [
      firm['Company Name'],
      firm.NotebookLM,
      firm['Contact Name'],
      firm.Title,
      firm.Email,
      firm.Website,
      firm.LinkedIn,
      firm['Sector Focus'],
      firm['Portfolio Companies'],
      firm.Status
    ]);

    // Append rows to Sheet1
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:J',
      valueInputOption: 'RAW',
      requestBody: {
        values: rows
      }
    });

    console.log(`✓ Successfully added ${newFirms.length} new firms!\n`);

    newFirms.forEach(firm => {
      console.log(`- ${firm['Company Name']} | ${firm['Contact Name']} (${firm.Title}) | ${firm.Email}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  }
}

addNewFirms();
