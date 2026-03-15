const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = './service-account.json';

async function main() {
  console.log('🔍 PE Research & Enrichment - 2026-03-14 8:07 AM\n');
  
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read all rows from Sheet1
  console.log('📊 Reading Sheet1...');
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:O',
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found in sheet.');
    return;
  }

  const headers = rows[0];
  console.log('Headers:', headers);
  
  // Column indices
  const COL_COMPANY = 0;      // A
  const COL_WEBSITE = 1;       // B
  const COL_CONTACT = 2;       // C
  const COL_TITLE = 3;         // D
  const COL_EMAIL = 4;         // E
  const COL_COMPANY_URL = 5;   // F
  const COL_LINKEDIN = 6;      // G
  const COL_STATUS = 7;        // H
  const COL_NOTES = 8;         // I
  const COL_CRM_STATUS = 9;    // J
  const COL_SCORE = 13;        // N

  // Find firms needing enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[COL_COMPANY] || '';
    const contact = row[COL_CONTACT] || '';
    const email = row[COL_EMAIL] || '';
    const status = row[COL_STATUS] || '';
    
    // Skip if company name is empty
    if (!company.trim()) continue;
    
    // Check if needs enrichment
    const emptyContact = !contact.trim();
    const genericEmail = email.match(/^(info@|sales@|ir@|contact@|inquiries@|hello@|support@)/i);
    const emptyEmail = !email.trim();
    
    if (emptyContact || genericEmail || emptyEmail) {
      needsEnrichment.push({
        rowIndex: i + 1, // 1-based for Google Sheets
        company,
        website: row[COL_WEBSITE] || '',
        contact,
        email,
        status,
      });
    }
  }

  console.log(`\n✅ Found ${needsEnrichment.length} firms needing enrichment`);
  console.log('\n📋 First 15 firms to enrich:\n');
  
  needsEnrichment.slice(0, 15).forEach((firm, idx) => {
    console.log(`${idx + 1}. ${firm.company} (Row ${firm.rowIndex})`);
    console.log(`   Website: ${firm.website || 'N/A'}`);
    console.log(`   Current: ${firm.contact || '(empty)'} / ${firm.email || '(empty)'}`);
    console.log('');
  });

  // Save to file for manual research
  const fs = require('fs');
  fs.writeFileSync(
    'enrichment-targets-march14-807am.json',
    JSON.stringify(needsEnrichment.slice(0, 15), null, 2)
  );

  console.log(`\n💾 Saved ${Math.min(15, needsEnrichment.length)} targets to enrichment-targets-march14-807am.json`);
  console.log('\nNext: Research each firm to find verified contacts');
}

main().catch(console.error);
