const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');

async function readSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read all data
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:K', // Adjust range as needed
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }

  const headers = rows[0];
  console.log('Headers:', headers);
  console.log('\nTotal rows:', rows.length - 1);

  // Find leads needing enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const contactName = row[2] || '';
    const email = row[3] || '';
    const status = row[7] || '';
    
    // Check if needs enrichment: empty contact name OR generic/empty email
    const hasGenericEmail = !email || email.includes('info@') || email.includes('sales@') || email.includes('ir@') || email.includes('contact@');
    const hasNoContact = !contactName || contactName.trim() === '';
    
    if (company && status !== 'Dead' && (hasNoContact || hasGenericEmail)) {
      needsEnrichment.push({
        rowIndex: i + 1,
        company,
        position: row[1] || '',
        contactName,
        email,
        status
      });
    }
  }

  console.log(`\nFound ${needsEnrichment.length} leads needing enrichment:`);
  needsEnrichment.slice(0, 15).forEach(lead => {
    console.log(`\nRow ${lead.rowIndex}: ${lead.company}`);
    console.log(`  Contact: ${lead.contactName || '(empty)'}`);
    console.log(`  Email: ${lead.email || '(empty)'}`);
    console.log(`  Status: ${lead.status}`);
  });

  return needsEnrichment;
}

readSheet().catch(console.error);
