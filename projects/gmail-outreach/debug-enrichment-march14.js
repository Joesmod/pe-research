const { google } = require('googleapis');

async function debugEnrichment() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:N',
  });
  
  const rows = response.data.values;
  
  console.log('=== DEBUGGING ROW 23 (HGGC) ===');
  const row23 = rows[22]; // 0-indexed
  console.log('Raw row:', row23);
  console.log('\nParsed:');
  console.log(`  Col 0 (Company): "${row23[0]}"`);
  console.log(`  Col 1 (Website?): "${row23[1]}"`);
  console.log(`  Col 2 (Contact): "${row23[2]}"`);
  console.log(`  Col 3 (Title): "${row23[3]}"`);
  console.log(`  Col 4 (Email): "${row23[4]}"`);
  console.log(`  Col 5: "${row23[5]}"`);
  console.log(`  Col 6: "${row23[6]}"`);
  console.log(`  Col 7 (Status): "${row23[7]}"`);
  console.log(`  Col 8 (Notes): "${row23[8]}"`);
  
  const company = (row23[0] || '').trim();
  const contact = (row23[2] || '').trim();
  const email = (row23[4] || '').trim();
  
  console.log(`\nChecks:`);
  console.log(`  company === contact: ${company === contact}`);
  console.log(`  !contact: ${!contact}`);
  console.log(`  !email: ${!email}`);
  console.log(`  hasGenericEmail: ${email && (email.includes('info@') || email.includes('sales@'))}`);
}

debugEnrichment().catch(console.error);
