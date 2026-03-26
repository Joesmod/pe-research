const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SA_PATH = path.join(__dirname, '..', 'projects', 'gmail-outreach', 'service-account.json');

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SA_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  // First, get sheet metadata to find sheetId
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const sheetId = meta.data.sheets[0].properties.sheetId;

  // Get current data to figure out column count
  const dataRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!1:1',
  });
  const colCount = dataRes.data.values ? dataRes.data.values[0].length : 11;
  console.log(`Found ${colCount} columns`);

  const requests = [
    // 1. Bold + gray background on row 1
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: colCount },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.85, green: 0.85, blue: 0.85 },
            textFormat: { bold: true },
          },
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat.bold)',
      },
    },
    // 2. Freeze row 1
    {
      updateSheetProperties: {
        properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
        fields: 'gridProperties.frozenRowCount',
      },
    },
    // 3. Auto-resize all columns
    {
      autoResizeDimensions: {
        dimensions: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: colCount },
      },
    },
  ];

  // If there's a Notes column (last one), make it wider
  requests.push({
    updateDimensionProperties: {
      range: { sheetId, dimension: 'COLUMNS', startIndex: colCount - 1, endIndex: colCount },
      properties: { pixelSize: 350 },
      fields: 'pixelSize',
    },
  });

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { requests },
  });

  console.log('Done — header styled, frozen, columns resized.');
}

main().catch(e => { console.error(e.message); process.exit(1); });
