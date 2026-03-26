const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

const COL = { COMPANY: 0, WEBSITE: 1, CONTACT_NAME: 2, TITLE: 3, EMAIL: 4, STATUS: 7 };

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A900:M1100',
  });
  
  const rows = res.data.values || [];
  console.log('🔍 Scanning rows 900-1100...\n');
  
  const needsEnrichment = [];
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const company = row[COL.COMPANY] || '';
    const website = row[COL.WEBSITE] || '';
    const contact = row[COL.CONTACT_NAME] || '';
    const email = row[COL.EMAIL] || '';
    const status = row[COL.STATUS] || '';
    
    if (!company || ['Dead', 'Bounced', 'Sent', 'Replied', 'Scheduled'].includes(status)) continue;
    
    const hasValidEmail = email && email.includes('@') && !email.startsWith('http');
    const hasGenericEmail = email && (email.includes('info@') || email.includes('sales@') || email.includes('ir@'));
    const needsContact = !contact || contact.startsWith('http');
    const needsEmail = !hasValidEmail || hasGenericEmail;
    
    if (needsContact || needsEmail) {
      needsEnrichment.push({
        row: i + 900 + 1,
        company,
        website,
        contact,
        title: row[COL.TITLE] || '',
        email,
        needsContact,
        needsEmail
      });
    }
  }
  
  console.log(`Found ${needsEnrichment.length} needing enrichment\n`);
  
  const batch = needsEnrichment.slice(0, 15);
  batch.forEach((l, i) => {
    console.log(`${i + 1}. ${l.company} (Row ${l.row})`);
    console.log(`   Site: ${l.website || '(none)'}`);
    console.log(`   Contact: ${l.contact || '(empty)'} | Title: ${l.title || '(empty)'}`);
    console.log(`   Email: ${l.email || '(empty)'}`);
    if (l.needsContact) console.log(`   ⚠️  Needs contact`);
    if (l.needsEmail) console.log(`   ⚠️  Needs email`);
    console.log('');
  });
  
  return batch;
}

main().catch(console.error);
