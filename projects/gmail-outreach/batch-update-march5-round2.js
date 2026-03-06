const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Round 2 enrichments - verified PE firms
const updates = [];

// First, find Goode Partners row
// Need to search sheet for Goode Partners
console.log('Reading sheet to find Goode Partners...');

async function main() {
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read all data
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:K'
  });
  
  const rows = res.data.values || [];
  
  // Find Goode Partners
  let goodeRow = -1;
  let sawMillRow = -1;
  
  for (let i = 0; i < rows.length; i++) {
    const company = rows[i][0] || '';
    if (company.toLowerCase().includes('goode partners')) {
      goodeRow = i + 1;
      console.log(`Found Goode Partners at row ${goodeRow}`);
    }
    if (company.toLowerCase().includes('saw mill capital')) {
      sawMillRow = i + 1;
      console.log(`Found Saw Mill Capital at row ${sawMillRow}`);
    }
  }
  
  const updates = [];
  
  if (goodeRow > 0) {
    updates.push({
      row: goodeRow,
      contactName: 'David Oddi',
      title: 'Partner',
      email: 'doddi@goodepartners.com',
      linkedin: 'https://www.linkedin.com/company/goode-partners',
      notes: 'Active Partner. Source: Company website team page (verified 2026-03-05). Other partners: Daniel Bonoff (dbonoff@goodepartners.com), Keith Miller (kmiller@goodepartners.com)',
      status: 'Enriched'
    });
  }
  
  console.log(`\nProcessing ${updates.length} updates...\n`);
  
  for (const update of updates) {
    try {
      if (update.contactName) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `Sheet1!C${update.row}`,
          valueInputOption: 'RAW',
          resource: { values: [[update.contactName]] }
        });
        console.log(`✓ Row ${update.row}: Updated Contact Name to "${update.contactName}"`);
      }
      
      if (update.title) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `Sheet1!D${update.row}`,
          valueInputOption: 'RAW',
          resource: { values: [[update.title]] }
        });
        console.log(`✓ Row ${update.row}: Updated Title to "${update.title}"`);
      }
      
      if (update.email) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `Sheet1!E${update.row}`,
          valueInputOption: 'RAW',
          resource: { values: [[update.email]] }
        });
        console.log(`✓ Row ${update.row}: Updated Email to "${update.email}"`);
      }
      
      if (update.linkedin) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `Sheet1!G${update.row}`,
          valueInputOption: 'RAW',
          resource: { values: [[update.linkedin]] }
        });
        console.log(`✓ Row ${update.row}: Updated LinkedIn`);
      }
      
      if (update.status) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `Sheet1!J${update.row}`,
          valueInputOption: 'RAW',
          resource: { values: [[update.status]] }
        });
        console.log(`✓ Row ${update.row}: Updated Status to "${update.status}"`);
      }
      
      if (update.notes) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `Sheet1!K${update.row}`,
          valueInputOption: 'RAW',
          resource: { values: [[update.notes]] }
        });
        console.log(`✓ Row ${update.row}: Updated Notes`);
      }
      
      console.log('');
    } catch (error) {
      console.error(`✗ Row ${update.row}: Error -`, error.message);
    }
  }
  
  console.log('Round 2 batch update complete!');
}

main().catch(console.error);
