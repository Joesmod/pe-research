const { google } = require('googleapis');
const fs = require('fs');

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read the sheet
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:J'
  });
  
  const rows = res.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  const headers = rows[0];
  console.log('Headers:', headers);
  
  // Find rows that need enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const contactName = row[2] || '';
    const email = row[3] || '';
    const status = row[8] || '';
    
    // Skip if status is Dead, Sent, Bounced, etc.
    if (status && ['Dead', 'Sent', 'Bounced', 'Replied'].includes(status)) {
      continue;
    }
    
    // Check if needs enrichment
    const hasNoContact = !contactName || contactName.trim() === '';
    const hasGenericEmail = email && (email.includes('info@') || email.includes('sales@') || email.includes('ir@') || email.includes('contact@'));
    const hasNoEmail = !email || email.trim() === '';
    
    if (company && (hasNoContact || hasGenericEmail || hasNoEmail)) {
      needsEnrichment.push({
        rowIndex: i,
        company,
        contactName,
        email,
        status,
        website: row[1] || '',
        title: row[4] || ''
      });
    }
  }
  
  console.log(`\nFound ${needsEnrichment.length} leads needing enrichment`);
  
  // Save to file
  fs.writeFileSync('enrich-targets-march7-836pm.json', JSON.stringify(needsEnrichment.slice(0, 15), null, 2));
  
  console.log('\nFirst 15 targets saved to enrich-targets-march7-836pm.json');
  console.log('\nSample targets:');
  needsEnrichment.slice(0, 5).forEach(t => {
    console.log(`- ${t.company} | Contact: ${t.contactName || 'EMPTY'} | Email: ${t.email || 'EMPTY'}`);
  });
}

main().catch(console.error);
