const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const keyFile = 'service-account.json';

async function scanEnrichmentNeeds() {
  const auth = new google.auth.GoogleAuth({
    keyFile,
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
  
  const headers = rows[0];
  console.log('Headers:', headers);
  
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const contactName = row[2] || '';
    const email = row[4] || '';
    const status = row[7] || '';
    
    const isEmptyContact = !contactName || contactName.trim() === '';
    const isGenericEmail = email && (
      email.toLowerCase().startsWith('info@') ||
      email.toLowerCase().startsWith('sales@') ||
      email.toLowerCase().startsWith('ir@') ||
      email.toLowerCase().startsWith('contact@')
    );
    
    if ((isEmptyContact || isGenericEmail) && status !== 'Dead' && status !== 'Sent') {
      needsEnrichment.push({
        rowIndex: i + 1,
        company,
        contactName,
        email,
        status,
        issue: isEmptyContact ? 'Empty Contact' : 'Generic Email'
      });
    }
  }
  
  console.log(`\nFound ${needsEnrichment.length} leads needing enrichment:\n`);
  needsEnrichment.slice(0, 20).forEach((lead, idx) => {
    console.log(`${idx + 1}. Row ${lead.rowIndex}: ${lead.company}`);
    console.log(`   Issue: ${lead.issue}`);
    console.log(`   Contact: ${lead.contactName || '(empty)'}`);
    console.log(`   Email: ${lead.email || '(empty)'}`);
    console.log(`   Status: ${lead.status}`);
    console.log('');
  });
  
  fs.writeFileSync('enrichment-needs-march17-8am.json', JSON.stringify(needsEnrichment, null, 2));
  console.log(`Full list saved to enrichment-needs-march17-8am.json`);
}

scanEnrichmentNeeds().catch(console.error);
