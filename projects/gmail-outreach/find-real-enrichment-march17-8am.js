const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const keyFile = 'service-account.json';

async function findRealEnrichmentNeeds() {
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
  console.log('Column mapping:');
  headers.forEach((h, i) => console.log(`  ${i}: ${h}`));
  
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const url = row[1] || '';
    const contactName = row[2] || '';
    const title = row[3] || '';
    const email = row[4] || '';
    const status = row[7] || '';
    
    // Skip completely empty rows
    if (!company.trim()) continue;
    
    // Skip already sent or dead
    if (status === 'Dead' || status === 'Sent') continue;
    
    const isEmptyContact = !contactName || contactName.trim() === '';
    const isGenericEmail = email && (
      email.toLowerCase().startsWith('info@') ||
      email.toLowerCase().startsWith('sales@') ||
      email.toLowerCase().startsWith('ir@') ||
      email.toLowerCase().startsWith('contact@') ||
      email.toLowerCase().startsWith('marketing@') ||
      email.toLowerCase().startsWith('hello@')
    );
    
    if (isEmptyContact || isGenericEmail) {
      needsEnrichment.push({
        rowIndex: i + 1,
        company,
        url,
        contactName,
        title,
        email,
        status,
        issue: isEmptyContact ? 'Empty Contact' : 'Generic Email'
      });
    }
  }
  
  console.log(`\nFound ${needsEnrichment.length} REAL leads needing enrichment:\n`);
  needsEnrichment.slice(0, 15).forEach((lead, idx) => {
    console.log(`${idx + 1}. Row ${lead.rowIndex}: ${lead.company}`);
    console.log(`   Issue: ${lead.issue}`);
    console.log(`   Contact: ${lead.contactName || '(empty)'}`);
    console.log(`   Title: ${lead.title || '(empty)'}`);
    console.log(`   Email: ${lead.email || '(empty)'}`);
    console.log(`   URL: ${lead.url}`);
    console.log(`   Status: ${lead.status}`);
    console.log('');
  });
  
  fs.writeFileSync('real-enrichment-needs-march17-8am.json', JSON.stringify(needsEnrichment, null, 2));
  console.log(`\nFull list saved to real-enrichment-needs-march17-8am.json`);
  console.log(`Total to enrich: ${needsEnrichment.length}`);
}

findRealEnrichmentNeeds().catch(console.error);
