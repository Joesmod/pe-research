const { google } = require('googleapis');
const key = require('./service-account.json');

const auth = new google.auth.GoogleAuth({
  credentials: key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function findTargets() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:N'
  });
  
  const rows = res.data.values || [];
  const header = rows[0];
  
  console.log(`Total rows in sheet: ${rows.length}`);
  console.log(`Header columns: ${header.join(' | ')}\n`);
  
  // Generic email patterns
  const genericEmailPattern = /^(info@|contact@|sales@|ir@|admin@|support@|hello@|inquiries@|general@)/i;
  
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1;
    
    const company = row[0];
    const contactName = row[2];
    const title = row[3];
    const email = row[4];
    const website = row[5];
    const status = row[9];
    const notes = row[11];
    
    // Skip if no company name
    if (!company || company.trim() === '') continue;
    
    // Skip if already contacted or dead lead
    if (status && (
      status.toLowerCase().includes('contacted') ||
      status.toLowerCase().includes('sent') ||
      status.toLowerCase().includes('dead') ||
      status.toLowerCase().includes('enriched')
    )) {
      continue;
    }
    
    // Check if needs enrichment
    const missingContact = !contactName || contactName.trim() === '' || contactName === 'Board of Directors';
    const missingEmail = !email || email.trim() === '';
    const hasGenericEmail = email && genericEmailPattern.test(email);
    const hasWebsite = website && website.trim() !== '';
    
    if ((missingContact || missingEmail || hasGenericEmail) && hasWebsite) {
      needsEnrichment.push({
        rowNum,
        company,
        website,
        contactName: contactName || '(empty)',
        email: email || '(empty)',
        status: status || '(empty)',
        reason: missingContact ? 'Missing contact name' : 
                missingEmail ? 'Missing email' : 
                'Generic email'
      });
    }
  }
  
  console.log(`\n=== ENRICHMENT TARGETS ===`);
  console.log(`Total firms needing enrichment: ${needsEnrichment.length}\n`);
  
  // Show first 15
  console.log(`First 15 targets:\n`);
  needsEnrichment.slice(0, 15).forEach(firm => {
    console.log(`Row ${firm.rowNum}: ${firm.company}`);
    console.log(`  Website: ${firm.website}`);
    console.log(`  Current Contact: ${firm.contactName}`);
    console.log(`  Current Email: ${firm.email}`);
    console.log(`  Reason: ${firm.reason}`);
    console.log(`  Status: ${firm.status}\n`);
  });
  
  // Save to file
  const fs = require('fs');
  fs.writeFileSync('enrichment-targets-march8-1136pm.json', JSON.stringify(needsEnrichment, null, 2));
  console.log(`\nSaved ${needsEnrichment.length} targets to enrichment-targets-march8-1136pm.json`);
}

findTargets().catch(console.error);
