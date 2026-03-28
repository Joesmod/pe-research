const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_KEY = '../gmail-outreach/service-account.json';

async function updateSheet() {
  const key = require(SERVICE_ACCOUNT_KEY);
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Read current sheet data
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:L',
  });

  const rows = res.data.values;
  const enrichments = JSON.parse(fs.readFileSync('./enrichment-batch.json', 'utf8'));

  console.log(`Found ${rows.length} rows in sheet`);
  console.log(`Processing ${enrichments.length} enrichments`);

  // Find and prepare updates
  const updates = [];
  
  enrichments.forEach(enrich => {
    // Find the row with this firm
    const rowIndex = rows.findIndex(row => 
      row[0] && row[0].toLowerCase().includes(enrich.firm.toLowerCase())
    );

    if (rowIndex === -1) {
      console.log(`❌ Firm not found in sheet: ${enrich.firm}`);
      return;
    }

    console.log(`✓ Found ${enrich.firm} at row ${rowIndex + 1}`);

    // Prepare update for this row
    // Columns: A=Firm, B=Website, C=Contact, D=Title, E=Email, F=LinkedIn, G=Status, H=Notes
    const row = rows[rowIndex];
    const updatedRow = [...row];
    
    // Update fields
    if (enrich.contact) updatedRow[2] = enrich.contact; // Column C
    if (enrich.title) updatedRow[3] = enrich.title; // Column D
    if (enrich.email) updatedRow[4] = enrich.email; // Column E
    if (enrich.linkedin) updatedRow[5] = enrich.linkedin; // Column F
    if (enrich.status) updatedRow[6] = enrich.status; // Column G
    if (enrich.source) {
      const existingNotes = updatedRow[7] || '';
      updatedRow[7] = existingNotes ? `${existingNotes} | ${enrich.source}` : enrich.source; // Column H
    }

    updates.push({
      range: `Sheet1!A${rowIndex + 1}:L${rowIndex + 1}`,
      values: [updatedRow]
    });
  });

  if (updates.length === 0) {
    console.log('⚠️  No updates to make');
    return;
  }

  // Batch update
  console.log(`\nUpdating ${updates.length} rows...`);
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      valueInputOption: 'RAW',
      data: updates
    }
  });

  console.log('✅ Sheet updated successfully!');
}

updateSheet().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
