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
  
  // Get sheet metadata to find last row
  const metadata = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID,
    ranges: ['Sheet1'],
  });
  
  console.log(`📊 Total rows in Sheet1: ${metadata.data.sheets[0].properties.gridProperties.rowCount}\n`);
  
  // Read last 100 rows
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1300:M1400',
  });
  
  const rows = res.data.values || [];
  console.log(`🔍 Scanning rows 1300-1400 (found ${rows.length} rows with data)...\n`);
  
  const needsEnrichment = [];
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const company = row[COL.COMPANY] || '';
    
    if (!company || company.trim() === '') continue;
    
    const website = row[COL.WEBSITE] || '';
    const contact = row[COL.CONTACT_NAME] || '';
    const email = row[COL.EMAIL] || '';
    const status = row[COL.STATUS] || '';
    
    if (['Dead', 'Bounced', 'Sent', 'Replied', 'Scheduled'].includes(status)) continue;
    
    const hasValidEmail = email && email.includes('@') && !email.startsWith('http');
    const hasGenericEmail = email && (email.includes('info@') || email.includes('sales@') || email.includes('ir@'));
    const needsContact = !contact || contact.startsWith('http');
    const needsEmail = !hasValidEmail || hasGenericEmail;
    
    if (needsContact || needsEmail) {
      needsEnrichment.push({
        row: i + 1300 + 1,
        company,
        website,
        contact,
        email
      });
    }
  }
  
  console.log(`Found ${needsEnrichment.length} needing enrichment in rows 1300-1400\n`);
  
  if (needsEnrichment.length > 0) {
    console.log('Sample:');
    needsEnrichment.slice(0, 5).forEach((l, i) => {
      console.log(`  ${i + 1}. ${l.company} (Row ${l.row})`);
    });
  }
}

main().catch(console.error);
