const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read ALL rows
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:I',
  });
  
  const rows = response.data.values || [];
  
  console.log('Full Sheet Scan\n');
  console.log(`Total rows: ${rows.length}\n`);
  
  const needsEnrichment = [];
  
  // Check every row (skip first if it's headers)
  const startRow = rows[0] && rows[0][0] === 'Company Name' ? 1 : 0;
  
  for (let i = startRow; i < rows.length; i++) {
    const row = rows[i] || [];
    const company = (row[0] || '').trim();
    const website = (row[1] || '').trim();
    const contactName = (row[2] || '').trim();
    const email = (row[4] || '').trim();
    const status = (row[7] || '').trim().toLowerCase();
    
    if (!company) continue;
    
    // Skip dead/not PE
    if (status.includes('dead') || status.includes('not pe')) {
      continue;
    }
    
    // Already enriched
    if (status === 'enriched') {
      continue;
    }
    
    // Generic email check
    const isGeneric = email && (
      email.toLowerCase().startsWith('info@') || 
      email.toLowerCase().startsWith('sales@') || 
      email.toLowerCase().startsWith('ir@') ||
      email.toLowerCase().startsWith('contact@') ||
      email.toLowerCase().startsWith('investors@') ||
      email.toLowerCase().startsWith('admin@')
    );
    
    // Needs enrichment if: no contact name OR no email OR generic email
    if (!contactName || !email || isGeneric) {
      needsEnrichment.push({
        rowIndex: i + 1,
        company,
        website,
        contactName: contactName || '[NONE]',
        email: email || '[NONE]',
        status: status || '[NONE]'
      });
    }
  }
  
  console.log(`Found ${needsEnrichment.length} firms needing enrichment:\n`);
  
  // Show first 20
  needsEnrichment.slice(0, 20).forEach((firm, idx) => {
    console.log(`${idx + 1}. Row ${firm.rowIndex}: ${firm.company}`);
    console.log(`   Website: ${firm.website || '[NONE]'}`);
    console.log(`   Contact: ${firm.contactName} | Email: ${firm.email}`);
    console.log(`   Status: ${firm.status}`);
    console.log('');
  });
  
  if (needsEnrichment.length > 20) {
    console.log(`... and ${needsEnrichment.length - 20} more\n`);
  }
}

main().catch(console.error);
