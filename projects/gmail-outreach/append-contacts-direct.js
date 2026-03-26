const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  const contacts = JSON.parse(fs.readFileSync('new-contacts.json', 'utf8'));

  for (const contact of contacts) {
    console.log(`Appending: ${contact[2]} at ${contact[0]}...`);
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [contact] },
    });
    console.log(`✓ Added ${contact[2]}`);
  }

  console.log(`\n✅ Successfully appended ${contacts.length} contacts`);
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
