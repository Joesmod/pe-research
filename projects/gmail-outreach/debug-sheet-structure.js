const { google } = require('googleapis');
const key = require('./service-account.json');

const SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function debugSheet() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth });

  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Sheet1!A:M'
  });

  const rows = result.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }

  const headers = rows[0];
  console.log('=== COLUMN STRUCTURE ===\n');
  headers.forEach((header, index) => {
    const letter = String.fromCharCode(65 + index); // A=65
    console.log(`Column ${letter} (${index}): ${header}`);
  });
  
  console.log('\n=== SAMPLE ROWS (First 20) ===\n');
  
  for (let i = 1; i < Math.min(20, rows.length); i++) {
    const row = rows[i];
    const company = row[0] || '';
    const contactName = row[2] || '';
    const email = row[4] || '';
    const website = row[5] || '';
    const status = row[9] || '';
    
    if (!company) continue;
    
    const hasIssue = !contactName || !email || email.includes('info@') || email.includes('sales@') || email.includes('ir@') || email.includes('contact@');
    
    if (hasIssue) {
      console.log(`\nRow ${i + 1}: ${company}`);
      console.log(`  Contact: "${contactName}"`);
      console.log(`  Email: "${email}"`);
      console.log(`  Website: "${website}"`);
      console.log(`  Status: "${status}"`);
      console.log(`  Needs enrichment: ${hasIssue ? 'YES' : 'NO'}`);
    }
  }
  
  // Count by status
  console.log('\n\n=== STATUS BREAKDOWN (All rows) ===\n');
  const statusCounts = {};
  let noStatus = 0;
  
  for (let i = 1; i < rows.length; i++) {
    const status = (rows[i][9] || '').trim().toLowerCase();
    if (!status) {
      noStatus++;
    } else {
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    }
  }
  
  console.log(`Empty status: ${noStatus}`);
  Object.entries(statusCounts).sort((a, b) => b[1] - a[1]).forEach(([status, count]) => {
    console.log(`${status}: ${count}`);
  });
}

debugSheet().catch(console.error);
