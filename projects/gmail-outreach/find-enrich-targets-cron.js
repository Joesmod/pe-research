const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

async function findTargets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:K',
  });
  
  const rows = res.data.values || [];
  if (rows.length <= 1) {
    console.log('No data rows found');
    return;
  }
  
  const header = rows[0];
  const targets = [];
  
  // Skip header (index 0)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const firmName = row[0] || '';
    const contactName = row[1] || '';
    const title = row[2] || '';
    const email = row[3] || '';
    const website = row[4] || '';
    const status = row[8] || '';
    
    // Skip if already enriched or dead
    if (status.toLowerCase().includes('enriched') || status.toLowerCase().includes('dead')) {
      continue;
    }
    
    // Check if needs enrichment
    const needsContact = !contactName || contactName === '-' || contactName === '';
    const hasGenericEmail = !email || 
      email.includes('info@') || 
      email.includes('sales@') || 
      email.includes('ir@') ||
      email.includes('contact@') ||
      email.includes('investor') ||
      email === '';
    
    if (needsContact || hasGenericEmail) {
      targets.push({
        rowIndex: i + 1, // Excel row number (1-indexed, +1 for header)
        firmName,
        website,
        contactName,
        email,
        status,
        needsContact,
        hasGenericEmail
      });
    }
    
    // Limit to first 20 targets
    if (targets.length >= 20) break;
  }
  
  console.log(`Found ${targets.length} firms needing enrichment:\n`);
  targets.forEach((t, idx) => {
    console.log(`${idx + 1}. Row ${t.rowIndex}: ${t.firmName}`);
    console.log(`   Website: ${t.website || '(none)'}`);
    console.log(`   Contact: ${t.contactName || '(EMPTY)'}`);
    console.log(`   Email: ${t.email || '(EMPTY)'}`);
    console.log(`   Status: ${t.status}`);
    console.log('');
  });
  
  return targets;
}

findTargets().catch(console.error);
