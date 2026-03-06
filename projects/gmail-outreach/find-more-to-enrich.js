const { google } = require('googleapis');
const path = require('path');

const KEYFILE = path.join(__dirname, 'service-account.json');
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const RANGE = 'Sheet1!A:L';

async function findNeedingEnrichment() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: RANGE
  });

  const rows = response.data.values || [];
  
  console.log('FIRMS NEEDING ENRICHMENT');
  console.log('=========================\n');

  const needEnrichment = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const firmName = row[0] || '';
    const contact = row[2] || '';
    const email = row[4] || '';
    const status = row[9] || '';
    
    // Look for firms with empty contact/email or generic emails or urls as contacts
    const needsWork = (
      !contact || 
      contact.startsWith('http') || 
      !email ||
      email.includes('info@') ||
      email.includes('contact@') ||
      email.includes('ir@') ||
      email.includes('sales@') ||
      status === 'New - Unresearched'
    );
    
    if (needsWork && firmName && firmName !== 'Company Name') {
      needEnrichment.push({
        row: i + 1,
        firm: firmName,
        contact: contact || '(empty)',
        email: email || '(empty)',
        status: status || '(empty)'
      });
    }
  }

  console.log(`Found ${needEnrichment.length} firms needing enrichment\n`);
  console.log('TOP 20 CANDIDATES:\n');
  
  needEnrichment.slice(0, 20).forEach((firm, idx) => {
    console.log(`${idx + 1}. ${firm.firm}`);
    console.log(`   Row: ${firm.row}`);
    console.log(`   Contact: ${firm.contact}`);
    console.log(`   Email: ${firm.email}`);
    console.log(`   Status: ${firm.status}\n`);
  });
}

findNeedingEnrichment().catch(console.error);
