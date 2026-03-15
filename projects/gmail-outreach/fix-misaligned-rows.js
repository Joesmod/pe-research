const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = './service-account.json';

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  console.log('\n🔍 Scanning for misaligned rows...\n');
  
  // Read all data
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A2:L',
  });

  const rows = response.data.values;
  const misaligned = [];
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const company = (row[0] || '').trim();
    const contactCol = (row[2] || '').trim();  // Should be Contact Name
    const titleCol = (row[3] || '').trim();    // Should be Title
    const emailCol = (row[4] || '').trim();    // Should be Email
    
    if (!company) continue;
    
    // Check if email column contains a name (no @ symbol)
    const emailLooksLikeName = emailCol && !emailCol.includes('@');
    
    // Check if columns C & D are empty but E+ have data
    const columnsEmptyButDataShifted = !contactCol && !titleCol && emailCol;
    
    if (emailLooksLikeName || columnsEmptyButDataShifted) {
      misaligned.push({
        rowIndex: i + 2,
        company,
        raw: row.slice(0, 12)
      });
    }
  }
  
  console.log(`Found ${misaligned.length} misaligned rows:\n`);
  
  misaligned.forEach(item => {
    console.log(`Row ${item.rowIndex}: ${item.company}`);
    console.log(`  C: ${item.raw[2] || '[empty]'}`);
    console.log(`  D: ${item.raw[3] || '[empty]'}`);
    console.log(`  E: ${item.raw[4] || '[empty]'}`);
    console.log(`  F: ${item.raw[5] || '[empty]'}`);
    console.log(`  G: ${item.raw[6] || '[empty]'}`);
    console.log('');
  });
  
  // Fix row 1206 specifically
  if (misaligned.some(r => r.rowIndex === 1206)) {
    console.log('\n🔧 Fixing row 1206 (Audax Private Equity)...');
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!C1206:G1206',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          'Young Lee',  // Contact Name (C)
          'Partner and Co-President',  // Title (D)
          'ylee@audaxprivateequity.com',  // Email (E)
          '',  // Website (F) - empty, already in B
          'https://www.linkedin.com/in/young-lee-3404b45b/'  // LinkedIn (G)
        ]]
      }
    });
    
    console.log('✅ Fixed row 1206');
  }
}

main().catch(console.error);
