const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = 'service-account.json';

async function checkStructure() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:I',
  });
  
  const rows = response.data.values || [];
  const header = rows[0];
  
  console.log('Header:', header);
  console.log('\nColumn indices:');
  header.forEach((col, idx) => {
    console.log(`  ${idx}: ${col}`);
  });
  
  console.log('\nLooking for target firms:');
  const targetFirms = ['Clearhaven Partners', 'Star Mountain Capital', 'Silas Capital', 'Spectrum Search Partners', 'Provident Healthcare Partners', 'Amity Search Partners'];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    
    if (targetFirms.some(firm => company.includes(firm) || firm.includes(company))) {
      console.log(`\nRow ${i + 1}: ${company}`);
      console.log('  Data:', row.slice(0, 9));
    }
  }
}

checkStructure().catch(console.error);
