const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function getAuth() {
  return new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

async function readSheet() {
  const auth = await getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:N',
  });
  
  return response.data.values || [];
}

async function main() {
  const rows = await readSheet();
  
  // Check specific rows that sheet.js said need enrichment
  const rowsToCheck = [402, 448, 490, 497, 498, 514, 516, 581, 582, 593];
  
  console.log('Checking specific rows mentioned by sheet.js:\n');
  
  for (const rowNum of rowsToCheck) {
    const row = rows[rowNum - 1]; // 0-indexed
    
    if (!row) {
      console.log(`Row ${rowNum}: NOT FOUND\n`);
      continue;
    }
    
    console.log(`Row ${rowNum}:`);
    console.log(`  A (Company): ${row[0] || '(empty)'}`);
    console.log(`  B: ${row[1] || '(empty)'}`);
    console.log(`  C (Contact): ${row[2] || '(empty)'}`);
    console.log(`  D (Title): ${row[3] || '(empty)'}`);
    console.log(`  E (Email): ${row[4] || '(empty)'}`);
    console.log(`  F (Website): ${row[5] || '(empty)'}`);
    console.log(`  G (LinkedIn): ${row[6] || '(empty)'}`);
    console.log(`  H: ${row[7] || '(empty)'}`);
    console.log(`  I (Notes): ${row[8] || '(empty)'}`);
    console.log(`  J (Status): ${row[9] || '(empty)'}`);
    console.log(`  Full row length: ${row.length}`);
    console.log('');
  }
}

main().catch(console.error);
