const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '1oiuiGHWyg01RKnFVk5FPcHI10y7VBWrAE1MaTAiM-sw';
const KEY_FILE = path.join(__dirname, 'service-account.json');

async function run() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  // Update rows for companies we just emailed (column F = status)
  // Row 2: Finkl Steel - already contacted previously
  // Row 3: McHugh Construction - just sent
  // Row 7: Horween Leather - just sent
  // Row 10: Fibersmith - just sent
  // Row 16: Con Yeager Spice - just sent
  // Row 18: Carmela Foods - just sent

  const updates = [
    { range: 'Sheet1!F3', values: [['Contacted']] },
    { range: 'Sheet1!F7', values: [['Contacted']] },
    { range: 'Sheet1!F10', values: [['Contacted']] },
    { range: 'Sheet1!F16', values: [['Contacted']] },
    { range: 'Sheet1!F18', values: [['Contacted']] },
  ];

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      valueInputOption: 'USER_ENTERED',
      data: updates,
    },
  });

  console.log('CRM updated - 5 leads marked as Contacted');
}

run().catch(e => { console.error(e.message); process.exit(1); });
