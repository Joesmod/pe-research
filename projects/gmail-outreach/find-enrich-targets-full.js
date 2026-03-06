const { google } = require('googleapis');
const key = require('./service-account.json');

const auth = new google.auth.GoogleAuth({
  credentials: key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function readSheet() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:N'
  });
  
  const rows = res.data.values || [];
  const header = rows[0];
  
  console.log(`Total rows: ${rows.length}`);
  console.log(`Header: ${header.join(', ')}\n`);
  
  // Find firms needing enrichment
  const genericEmailPattern = /^(info@|contact@|sales@|ir@|admin@|support@)/i;
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1;
    
    const company = row[0];
    const website = row[5];
    const contactName = row[2];
    const email = row[4];
    const status = row[9];
    
    if (!company) continue;
    
    // Skip if already contacted or dead lead
    if (status && (status.toLowerCase().includes('contacted') || status.toLowerCase().includes('dead'))) {
      continue;
    }
    
    const missingContact = !contactName || contactName.trim() === '' || contactName === 'Board of Directors';
    const missingEmail = !email || email.trim() === '';
    const hasGenericEmail = email && genericEmailPattern.test(email);
    
    if ((missingContact || missingEmail || hasGenericEmail) && website && website.trim() !== '') {
      needsEnrichment.push({
        rowNum,
        company,
        website,
        contactName: contactName || '',
        email: email || '',
        status: status || ''
      });
    }
  }
  
  console.log(`\nTotal firms needing enrichment: ${needsEnrichment.length}\n`);
  console.log('=== TOP 15 PRIORITY TARGETS FOR MANUAL ENRICHMENT ===\n');
  
  // Show first 15 for manual enrichment
  needsEnrichment.slice(0, 15).forEach((firm, idx) => {
    console.log(`${idx + 1}. [Row ${firm.rowNum}] ${firm.company}`);
    console.log(`   Website: ${firm.website}`);
    console.log(`   Current: ${firm.contactName || '(no name)'} - ${firm.email || '(no email)'}`);
    console.log('');
  });
}

readSheet().catch(console.error);
