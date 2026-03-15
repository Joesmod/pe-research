const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = './service-account.json';

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:Z',
  });

  const rows = response.data.values;
  
  console.log('\n🔍 Scanning for data alignment issues...\n');
  
  const issues = [];
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const contact = row[2] || '';
    const title = row[3] || '';
    const email = row[4] || '';
    
    if (company === 'Company Name') continue;
    if (!company || company.trim() === '') continue;
    
    // Check for misalignments
    let problem = null;
    
    // Email in title column
    if (title && title.includes('@')) {
      problem = 'Email in Title column';
    }
    // LinkedIn URL in email column
    else if (email && (email.includes('linkedin.com') || email.startsWith('http'))) {
      problem = 'LinkedIn URL in Email column';
    }
    // No @ in email column (but has text)
    else if (email && email.trim() !== '' && !email.includes('@')) {
      problem = 'Invalid email format (no @)';
    }
    
    if (problem) {
      issues.push({
        rowIndex: i + 1,
        company,
        contact,
        title,
        email,
        problem
      });
    }
  }
  
  console.log(`Found ${issues.length} rows with alignment issues:\n`);
  console.log('='.repeat(80));
  
  issues.forEach(issue => {
    console.log(`\nRow ${issue.rowIndex}: ${issue.company}`);
    console.log(`  Contact: ${issue.contact}`);
    console.log(`  Title: ${issue.title}`);
    console.log(`  Email: ${issue.email}`);
    console.log(`  ⚠️  ${issue.problem}`);
  });
  
  fs.writeFileSync(
    'data-alignment-issues-march14.json',
    JSON.stringify(issues, null, 2)
  );
  
  console.log(`\n\n💾 Saved ${issues.length} issues to data-alignment-issues-march14.json`);
}

main().catch(console.error);
