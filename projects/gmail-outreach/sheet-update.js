const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SHEET_NAME = 'Sheet1';
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // First, read current data to find row numbers
  const readResult = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A:K`,
  });

  const rows = readResult.data.values || [];
  
  // Find Access Holdings row
  let accessRow = -1;
  let altamontRow = -1;
  
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] && rows[i][0].includes('Access Holdings')) {
      accessRow = i + 1; // +1 for 1-indexed sheets
    }
    if (rows[i][0] && rows[i][0].includes('Altamont Capital')) {
      altamontRow = i + 1;
    }
  }

  const updates = [];

  // Update Access Holdings
  if (accessRow > 0) {
    updates.push({
      range: `${SHEET_NAME}!C${accessRow}`,
      values: [['Kevin McAllister']],
    });
    updates.push({
      range: `${SHEET_NAME}!D${accessRow}`,
      values: [['Founder & Managing Partner']],
    });
    updates.push({
      range: `${SHEET_NAME}!E${accessRow}`,
      values: [['kmcallister@accessholdings.com']],
    });
    updates.push({
      range: `${SHEET_NAME}!F${accessRow}`,
      values: [['https://www.linkedin.com/company/access-holdings']],
    });
    updates.push({
      range: `${SHEET_NAME}!G${accessRow}`,
      values: [['443.836.6931']],
    });
    updates.push({
      range: `${SHEET_NAME}!J${accessRow}`,
      values: [['Enriched']],
    });
    updates.push({
      range: `${SHEET_NAME}!K${accessRow}`,
      values: [['Pattern: first_initial+last@accessholdings.com. Partners: Omar Rahman, Sam Tidswell-Norrish, Chris Blackwell. Baltimore HQ. Lower-middle market PE focused on essential services.']],
    });
  }

  // Update Altamont Capital Partners
  if (altamontRow > 0) {
    updates.push({
      range: `${SHEET_NAME}!C${altamontRow}`,
      values: [['Jesse Rogers']],
    });
    updates.push({
      range: `${SHEET_NAME}!D${altamontRow}`,
      values: [['Co-Founder, Managing Director']],
    });
    updates.push({
      range: `${SHEET_NAME}!E${altamontRow}`,
      values: [['jrogers@altamontcapital.com']],
    });
    updates.push({
      range: `${SHEET_NAME}!F${altamontRow}`,
      values: [['https://www.linkedin.com/company/altamont-capital-partners']],
    });
    updates.push({
      range: `${SHEET_NAME}!G${altamontRow}`,
      values: [['650.264.7750']],
    });
    updates.push({
      range: `${SHEET_NAME}!J${altamontRow}`,
      values: [['Enriched']],
    });
    updates.push({
      range: `${SHEET_NAME}!K${altamontRow}`,
      values: [['Pattern: first_initial+last@altamontcapital.com. Managing Directors: Randall Eason (reason@), Keoni Schwartz (kschwartz@), Kristin Horne Johnson (kjohnson@). Palo Alto/Austin/SF. Lower-middle market PE, value creation focus. Former Golden Gate Capital team.']],
    });
  }

  // Execute batch update
  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates,
      },
    });

    console.log(`✅ Updated ${updates.length} cells across ${accessRow > 0 ? 1 : 0 + altamontRow > 0 ? 1 : 0} firms`);
    console.log(`   - Access Holdings: Row ${accessRow || 'NOT FOUND'}`);
    console.log(`   - Altamont Capital: Row ${altamontRow || 'NOT FOUND'}`);
  } else {
    console.log('❌ No matching firms found in sheet');
  }
}

updateSheet().catch(console.error);
