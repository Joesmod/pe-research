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
  
  console.log('📊 Reading all rows from Sheet1...');
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:O',
  });
  
  const rows = response.data.values;
  console.log(`Total rows in sheet: ${rows.length}`);
  
  let needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) { // Skip row 0 (might be header)
    const row = rows[i];
    const company = row[0] || '';
    const website = row[1] || '';
    const contact = row[2] || '';
    const title = row[3] || '';
    const email = row[4] || '';
    const status = row[7] || '';
    
    if (!company.trim()) continue;
    
    const emptyContact = !contact.trim();
    const genericEmail = email && email.match(/^(info@|sales@|ir@|contact@|inquiries@|hello@|support@|team@|admin@)/i);
    const emptyEmail = !email.trim();
    
    if (emptyContact || genericEmail || emptyEmail) {
      needsEnrichment.push({
        row: i + 1,
        company,
        website,
        contact: contact || '(EMPTY)',
        title: title || '(EMPTY)',
        email: email || '(EMPTY)',
        status
      });
    }
  }
  
  console.log(`\nTotal needing enrichment: ${needsEnrichment.length}\n`);
  
  if (needsEnrichment.length === 0) {
    console.log('✅ No firms need enrichment! All have valid contacts.');
    return;
  }
  
  console.log('First 20 firms needing enrichment:\n');
  needsEnrichment.slice(0, 20).forEach((f, idx) => {
    console.log(`${idx + 1}. Row ${f.row}: ${f.company}`);
    console.log(`   Website: ${f.website}`);
    console.log(`   Contact: ${f.contact} | Email: ${f.email}`);
    console.log('');
  });
  
  // Save to file
  fs.writeFileSync(
    'unenriched-firms-march14-807am.json',
    JSON.stringify(needsEnrichment.slice(0, 15), null, 2)
  );
  
  console.log(`\n💾 Saved ${Math.min(15, needsEnrichment.length)} firms to unenriched-firms-march14-807am.json`);
}

main().catch(console.error);
