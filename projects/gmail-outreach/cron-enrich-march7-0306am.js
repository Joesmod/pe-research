const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read Sheet1
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:K'
  });

  const rows = res.data.values || [];
  if (rows.length === 0) {
    console.log('No data found');
    return;
  }

  const headers = rows[0];
  console.log('Headers:', headers);
  
  // Find firms needing enrichment (empty Contact Name or generic/empty Email)
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const position = row[1] || '';
    const contactName = row[2] || '';
    const email = row[3] || '';
    const status = row[7] || '';
    
    // Skip if already marked as dead or enriched with real contact
    if (status === 'Dead' || status === 'Sent') continue;
    
    // Need enrichment if:
    // - No contact name
    // - No email or generic email (info@, sales@, ir@, contact@)
    const isGenericEmail = email && (
      email.toLowerCase().startsWith('info@') ||
      email.toLowerCase().startsWith('sales@') ||
      email.toLowerCase().startsWith('ir@') ||
      email.toLowerCase().startsWith('contact@') ||
      email.toLowerCase().startsWith('admin@') ||
      email.toLowerCase().startsWith('hello@')
    );
    
    if (!contactName || !email || isGenericEmail) {
      needsEnrichment.push({
        row: i + 1,
        company,
        position,
        contactName,
        email,
        status,
        needsName: !contactName,
        needsEmail: !email || isGenericEmail
      });
    }
  }
  
  console.log(`\nTotal rows: ${rows.length - 1}`);
  console.log(`Firms needing enrichment: ${needsEnrichment.length}`);
  
  // Save to file
  fs.writeFileSync(
    'enrich-targets-march7-0306am.json',
    JSON.stringify(needsEnrichment.slice(0, 15), null, 2)
  );
  
  console.log('\nFirst 15 targets needing enrichment:');
  needsEnrichment.slice(0, 15).forEach(target => {
    console.log(`Row ${target.row}: ${target.company} - Missing: ${target.needsName ? 'Name' : ''}${target.needsEmail ? ' Email' : ''}`);
  });
}

main().catch(console.error);
