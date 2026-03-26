const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const keyFile = 'service-account.json';

async function scanNeedsEnrichment() {
  const auth = new google.auth.GoogleAuth({
    keyFile,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A2:I',  // Start from row 2, skip mixed header row
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  const needsEnrichment = [];
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const url = row[1] || '';
    const contactName = row[2] || '';
    const title = row[3] || '';
    const email = row[4] || '';
    const secondaryInfo = row[5] || '';
    const linkedin = row[6] || '';
    const status = row[7] || '';
    const notes = row[8] || '';
    
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
        rowIndex: i + 2,  // +2 because we start from row 2 (index 0)
        company,
        url,
        contactName,
        title,
        email,
        linkedin,
        status,
        notes,
        issue: isEmptyContact ? 'Empty Contact' : 'Generic Email'
      });
    }
  }
  
  console.log(`\nFound ${needsEnrichment.length} leads needing enrichment\n`);
  console.log('First 15 leads to research:\n');
  needsEnrichment.slice(0, 15).forEach((lead, idx) => {
    console.log(`${idx + 1}. Row ${lead.rowIndex}: ${lead.company}`);
    console.log(`   Issue: ${lead.issue}`);
    console.log(`   Contact: ${lead.contactName || '(EMPTY - NEED TO FIND)'}`);
    console.log(`   Title: ${lead.title || '(empty)'}`);
    console.log(`   Email: ${lead.email || '(EMPTY - NEED TO FIND)'}`);
    console.log(`   URL: ${lead.url || 'N/A'}`);
    console.log(`   Status: ${lead.status || 'Not started'}`);
    console.log('');
  });
  
  fs.writeFileSync('needs-enrichment-march17-8am.json', JSON.stringify(needsEnrichment, null, 2));
  console.log(`Full list saved to needs-enrichment-march17-8am.json`);
  console.log(`Total to enrich: ${needsEnrichment.length}`);
}

scanNeedsEnrichment().catch(console.error);
