const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function main() {
  console.log('=== Reading Sheet for Manual Enrichment Targets ===\n');
  
  const sheets = await getSheets();
  
  // Read current sheet data
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:J',
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  const headers = rows[0];
  const dataRows = rows.slice(1);
  
  // Identify rows needing enrichment
  const needsEnrichment = [];
  dataRows.forEach((row, idx) => {
    const company = row[0] || '';
    const contact = row[2] || '';
    const email = row[4] || '';
    const website = row[5] || '';
    const linkedin = row[6] || '';
    const status = row[8] || '';
    
    // Skip if no company name
    if (!company || company === '(empty)') return;
    
    // Need enrichment if:
    // - No contact name OR
    // - No email OR
    // - Generic email (info@, sales@, ir@, contact@)
    const hasGenericEmail = email && email.match(/(info@|sales@|ir@|contact@|hello@|admin@|team@)/i);
    const needsContact = !contact || !email || hasGenericEmail;
    
    if (!needsContact) return;
    
    // Skip duplicates
    if (needsEnrichment.find(item => item.company === company)) return;
    
    needsEnrichment.push({
      rowIndex: idx + 2,
      company,
      website,
      linkedin,
      currentContact: contact,
      currentEmail: email,
      currentStatus: status
    });
  });
  
  console.log(`Total firms needing enrichment: ${needsEnrichment.length}\n`);
  console.log('First 15 targets for manual research:\n');
  
  const targets = needsEnrichment.slice(0, 15);
  targets.forEach((firm, idx) => {
    console.log(`${idx + 1}. [Row ${firm.rowIndex}] ${firm.company}`);
    console.log(`   Website: ${firm.website || '(none)'}`);
    console.log(`   LinkedIn: ${firm.linkedin || '(none)'}`);
    console.log(`   Current Contact: ${firm.currentContact || '(none)'}`);
    console.log(`   Current Email: ${firm.currentEmail || '(none)'}`);
    console.log('');
  });
  
  // Save targets to JSON for processing
  fs.writeFileSync(
    'manual-enrich-targets-0406am.json',
    JSON.stringify(targets, null, 2)
  );
  
  console.log('Targets saved to: manual-enrich-targets-0406am.json');
}

main().catch(console.error);
