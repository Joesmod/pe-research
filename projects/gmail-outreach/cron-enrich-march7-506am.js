const { google } = require('googleapis');
const key = require('./service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read the sheet
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:K',
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  const headers = rows[0];
  console.log('Headers:', headers);
  console.log('\nAnalyzing enrichment needs...\n');
  
  // Find columns
  const companyIdx = headers.indexOf('Company');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const statusIdx = headers.indexOf('Status');
  
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    
    // Check if needs enrichment
    const hasGenericEmail = email && (
      email.startsWith('info@') ||
      email.startsWith('sales@') ||
      email.startsWith('ir@') ||
      email.startsWith('contact@') ||
      email.startsWith('investors@')
    );
    
    if (!contact || hasGenericEmail || !email) {
      needsEnrichment.push({
        row: i + 1,
        company,
        contact,
        email,
        status,
        reason: !contact ? 'No contact' : hasGenericEmail ? 'Generic email' : 'No email'
      });
    }
  }
  
  console.log(`Found ${needsEnrichment.length} firms needing enrichment:\n`);
  needsEnrichment.slice(0, 15).forEach(item => {
    console.log(`Row ${item.row}: ${item.company} - ${item.reason}`);
  });
}

main().catch(console.error);
