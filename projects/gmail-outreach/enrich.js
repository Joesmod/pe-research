const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

async function getClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function enrichFirms(enrichments) {
  const sheets = await getClient();
  
  // Read current sheet
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1',
  });
  const rows = res.data.values || [];
  if (rows.length === 0) {
    console.log('Sheet is empty');
    return;
  }

  // Sheet structure (based on actual data inspection)
  const firmIdx = 0;      // Company Name
  const websiteIdx = 1;   // Website URL
  const contactIdx = 2;   // Contact Name
  const titleIdx = 3;     // Title
  const emailIdx = 4;     // Email
  const linkedinIdx = 6;  // LinkedIn URL (column 5 is often empty)
  const statusIdx = 7;    // Status
  const notesIdx = 8;     // Notes

  console.log(`\nSheet structure:`);
  console.log(`  Company: col ${firmIdx}, Contact: col ${contactIdx}, Title: col ${titleIdx}`);
  console.log(`  Email: col ${emailIdx}, LinkedIn: col ${linkedinIdx}, Status: col ${statusIdx}, Notes: col ${notesIdx}\n`);

  let updated = 0;
  for (const e of enrichments) {
    // Find the row with matching firm name (case-insensitive, flexible matching)
    let rowIndex = -1;
    const searchFirm = e.firm.toLowerCase().replace(/[^\w\s]/g, '').trim();
    
    for (let i = 1; i < rows.length; i++) {
      const sheetFirm = (rows[i][firmIdx] || '').toLowerCase().replace(/[^\w\s]/g, '').trim();
      if (sheetFirm.includes(searchFirm) || searchFirm.includes(sheetFirm)) {
        rowIndex = i;
        break;
      }
    }

    if (rowIndex === -1) {
      console.log(`⚠️  Firm not found in sheet: ${e.firm}`);
      continue;
    }

    // Update the row
    const row = rows[rowIndex];
    row[contactIdx] = e.contact;
    row[titleIdx] = e.title;
    row[emailIdx] = e.email || '';
    row[linkedinIdx] = e.linkedin || '';
    row[statusIdx] = e.status || 'Contact Found';
    row[notesIdx] = e.notes || '';

    // Write back to sheet (row numbers in Sheets are 1-indexed, and we have header)
    const sheetRow = rowIndex + 1;
    const range = `Sheet1!A${sheetRow}:Z${sheetRow}`;
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] },
    });

    console.log(`✅ Updated ${e.firm} - ${e.contact} (${e.title}) - Row ${sheetRow}`);
    updated++;
  }

  console.log(`\n🎯 Enrichment complete: ${updated} firms updated`);
}

// Read enrichments from file or command line arg (JSON)
const enrichArg = process.argv[2];
if (!enrichArg) {
  console.log('Usage: node enrich.js <file.json> OR \'[{"firm":"...","contact":"...","title":"...","email":"...","linkedin":"...","status":"...","notes":"..."}]\'');
  process.exit(1);
}

let enrichments;
if (enrichArg.endsWith('.json')) {
  // Read from file
  const fs = require('fs');
  const filePath = path.isAbsolute(enrichArg) ? enrichArg : path.join(__dirname, enrichArg);
  enrichments = JSON.parse(fs.readFileSync(filePath, 'utf8'));
} else {
  // Parse from command line
  enrichments = JSON.parse(enrichArg);
}
enrichFirms(enrichments).catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
