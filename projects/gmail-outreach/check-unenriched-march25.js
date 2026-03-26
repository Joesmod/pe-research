const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

async function checkUnenriched() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:I',
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }

  const unenriched = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1;
    
    const company = row[0] || '';
    const website = row[1] || '';
    const contact = row[2] || '';
    const title = row[3] || '';
    const email = row[4] || '';
    const linkedIn = row[6] || '';
    const status = row[7] || '';
    const notes = row[8] || '';

    // Skip rows without a company name
    if (!company || company.trim() === '') continue;

    // Skip dead/not PE
    if (status && (status.toLowerCase().includes('dead') || status.toLowerCase().includes('not pe'))) continue;

    // Find firms that are NOT marked as "Enriched"
    if (!status || !status.toLowerCase().includes('enriched')) {
      unenriched.push({
        rowNum,
        company,
        website,
        contact,
        title,
        email,
        linkedIn,
        status,
        notes
      });
    }
  }

  console.log(`\n🔍 Found ${unenriched.length} UN-ENRICHED PE firms\n`);
  console.log('=' .repeat(80) + '\n');

  // Show first 15
  unenriched.slice(0, 15).forEach((firm, idx) => {
    console.log(`${idx + 1}. Row ${firm.rowNum}: ${firm.company}`);
    console.log(`   Website: ${firm.website || '(NONE)'}`);
    console.log(`   Contact: ${firm.contact || '(EMPTY - NEEDS ENRICHMENT)'}`);
    console.log(`   Title: ${firm.title || '(none)'}`);
    console.log(`   Email: ${firm.email || '(EMPTY - NEEDS ENRICHMENT)'}`);
    console.log(`   LinkedIn: ${firm.linkedIn || '(none)'}`);
    console.log(`   Status: ${firm.status || '(Not set)'}`);
    console.log(`   Notes: ${firm.notes ? firm.notes.substring(0, 60) + '...' : '(none)'}`);
    console.log('');
  });

  console.log('=' .repeat(80));
  console.log(`\n📊 ANALYSIS:`);
  
  const emptyContact = unenriched.filter(f => !f.contact || f.contact.trim() === '').length;
  const emptyEmail = unenriched.filter(f => !f.email || f.email.trim() === '').length;
  const emptyWebsite = unenriched.filter(f => !f.website || f.website.trim() === '').length;
  const hasContactAndEmail = unenriched.filter(f => f.contact && f.email).length;

  console.log(`  Empty Contact Name: ${emptyContact}`);
  console.log(`  Empty Email: ${emptyEmail}`);
  console.log(`  Empty Website: ${emptyWebsite}`);
  console.log(`  Has Contact AND Email: ${hasContactAndEmail}`);
  
  return unenriched;
}

checkUnenriched().catch(console.error);
