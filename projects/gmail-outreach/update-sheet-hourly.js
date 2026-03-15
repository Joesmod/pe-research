const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

async function getClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function updateSheet() {
  const findings = JSON.parse(fs.readFileSync('enrichment-findings-hourly-march9.json', 'utf-8'));
  const sheets = await getClient();
  
  // Read the current sheet to find row numbers
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1',
  });
  
  const rows = res.data.values || [];
  const updates = [];
  
  for (const finding of findings) {
    // Find the row for this company
    const rowIndex = rows.findIndex(row => row[0] === finding.company && row[2] === finding.contactName);
    
    if (rowIndex === -1) {
      console.log(`⚠️  Could not find row for ${finding.company} - ${finding.contactName}`);
      continue;
    }
    
    // Row number in A1 notation (1-indexed, accounting for header)
    const rowNum = rowIndex + 1;
    
    console.log(`✅ Updating ${finding.company} at row ${rowNum}`);
    
    // Update Title (column D), Email (column E), LinkedIn (column G), Status (column J)
    updates.push({
      range: `Sheet1!D${rowNum}:G${rowNum}`,
      values: [[
        finding.title,
        finding.email,
        finding.website,
        finding.linkedin
      ]]
    });
    
    // Update Status to "Enriched"
    updates.push({
      range: `Sheet1!J${rowNum}`,
      values: [['Enriched']]
    });
  }
  
  // Batch update all changes
  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: updates
      }
    });
    
    console.log(`\n✅ Successfully updated ${findings.length} leads in Google Sheet`);
  } else {
    console.log('\n⚠️  No updates made');
  }
  
  return findings;
}

updateSheet().catch(console.error);
