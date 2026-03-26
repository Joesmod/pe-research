const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = 'service-account.json';

async function findToEnrich() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:N',
  });
  
  const rows = response.data.values || [];
  const header = rows[0];
  
  // Column indices
  const companyCol = 0;
  const contactCol = 2;
  const emailCol = 4;
  const statusCol = 9;
  const notesCol = 11;
  
  console.log('🔍 Finding leads that need enrichment...\n');
  
  const needEnrichment = [];
  const nonPEFirms = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyCol] || '';
    const contact = row[contactCol] || '';
    const email = row[emailCol] || '';
    const status = row[statusCol] || '';
    
    if (!company) continue; // Skip empty rows
    
    // Check if it's a non-PE firm (investment bank, search firm, etc.)
    const nonPEKeywords = ['Search Partners', 'Capital Advisors', 'Investment Bank', 'Advisory', 'M&A'];
    const isLikelyNonPE = nonPEKeywords.some(keyword => company.includes(keyword));
    
    // Check if it needs enrichment
    const hasGenericEmail = email && (email.includes('info@') || email.includes('ir@') || email.includes('sales@') || email.includes('contact@'));
    const needsContact = !contact || contact.trim() === '';
    const needsEmail = !email || email.trim() === '' || hasGenericEmail;
    
    if (needsContact || needsEmail) {
      const rowData = {
        row: i + 1,
        company,
        contact,
        email,
        status,
        reason: []
      };
      
      if (needsContact) rowData.reason.push('Missing contact');
      if (!email || email.trim() === '') rowData.reason.push('Missing email');
      if (hasGenericEmail) rowData.reason.push('Generic email');
      
      if (isLikelyNonPE) {
        nonPEFirms.push(rowData);
      } else if (!status.includes('Dead')) {
        needEnrichment.push(rowData);
      }
    }
  }
  
  console.log(`📊 Found ${needEnrichment.length} PE firms needing enrichment:\n`);
  needEnrichment.slice(0, 15).forEach(item => {
    console.log(`Row ${item.row}: ${item.company}`);
    console.log(`  Reason: ${item.reason.join(', ')}`);
    console.log(`  Current: ${item.contact || '(no contact)'} / ${item.email || '(no email)'}`);
    console.log('');
  });
  
  console.log(`\n🚫 Found ${nonPEFirms.length} non-PE firms to mark as Dead:\n`);
  nonPEFirms.slice(0, 10).forEach(item => {
    console.log(`Row ${item.row}: ${item.company}`);
  });
}

findToEnrich().catch(console.error);
