const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = JSON.parse(fs.readFileSync('service-account.json'));

async function verifyStatus() {
  const auth = new google.auth.GoogleAuth({
    credentials: SERVICE_ACCOUNT,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:M',
  });

  const rows = response.data.values;
  const statusCounts = {};
  const examples = {};
  
  // Skip header row
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const contactName = row[2] || '';
    const email = row[4] || '';
    const status = row[7] || '';
    
    if (!company) continue;
    
    const key = status || '(empty)';
    statusCounts[key] = (statusCounts[key] || 0) + 1;
    
    if (!examples[key]) {
      examples[key] = {
        company,
        contactName,
        email,
        rowIndex: i + 1
      };
    }
  }
  
  console.log('\n📊 Status distribution:\n');
  Object.keys(statusCounts).forEach(status => {
    console.log(`${status}: ${statusCounts[status]} leads`);
    const ex = examples[status];
    console.log(`  Example: Row ${ex.rowIndex} - ${ex.company}`);
    console.log(`    Contact: ${ex.contactName || '(empty)'}`);
    console.log(`    Email: ${ex.email || '(empty)'}\n`);
  });
  
  // Check for non-Enriched statuses
  const nonEnriched = Object.keys(statusCounts).filter(s => s !== 'Enriched');
  
  if (nonEnriched.length > 0) {
    console.log(`\n⚠️  Found ${nonEnriched.length} non-Enriched status types`);
  } else {
    console.log(`\n✅ All ${statusCounts['Enriched'] || 0} leads are marked "Enriched"`);
  }
}

verifyStatus().catch(console.error);
