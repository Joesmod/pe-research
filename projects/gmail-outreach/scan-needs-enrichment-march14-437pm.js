const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

async function main() {
  console.log('=== PE Research & Enrichment Scan - March 14, 4:37 PM ===\n');
  
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read the sheet (skip row 1 which is headers)
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A2:M',
  });
  
  const rows = res.data.values || [];
  console.log(`Total firms in sheet: ${rows.length}\n`);
  
  // Column mapping based on inspection
  const COL = {
    COMPANY: 0,      // A
    WEBSITE: 1,      // B
    CONTACT: 2,      // C
    TITLE: 3,        // D
    EMAIL: 4,        // E
    ALT_FIELD: 5,    // F
    LINKEDIN: 6,     // G
    STATUS: 7,       // H
    NOTES1: 8,       // I
    NOTES2: 9,       // J
    LAST_CONTACTED: 10, // K
    NOTES3: 11,      // L
    INFO_URL: 12     // M
  };
  
  const needsEnrichment = [];
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // +2 because we skip row 1 (headers) and array is 0-indexed
    
    const company = (row[COL.COMPANY] || '').trim();
    const contact = (row[COL.CONTACT] || '').trim();
    const email = (row[COL.EMAIL] || '').trim();
    const status = (row[COL.STATUS] || '').trim();
    
    // Skip if no company name
    if (!company) continue;
    
    // Skip if status is Dead, Duplicate, Sent, Replied, Bounced
    if (['Dead', 'Duplicate', 'Sent', 'Replied', 'Bounced'].some(s => status.toLowerCase().includes(s.toLowerCase()))) {
      continue;
    }
    
    // Check if needs enrichment
    const hasNoContact = !contact;
    const hasGenericEmail = email && (
      email.toLowerCase().startsWith('info@') ||
      email.toLowerCase().startsWith('sales@') ||
      email.toLowerCase().startsWith('ir@') ||
      email.toLowerCase().startsWith('contact@') ||
      email.toLowerCase().startsWith('hello@')
    );
    const hasNoEmail = !email;
    
    if (hasNoContact || hasGenericEmail || hasNoEmail) {
      needsEnrichment.push({
        rowNum,
        company,
        website: row[COL.WEBSITE] || '',
        contact,
        title: row[COL.TITLE] || '',
        email,
        status,
        linkedin: row[COL.LINKEDIN] || '',
        issue: hasNoContact ? 'No Contact Name' : (hasNoEmail ? 'No Email' : 'Generic Email')
      });
    }
  }
  
  console.log(`Leads needing enrichment: ${needsEnrichment.length}\n`);
  
  // Take top 15
  const top15 = needsEnrichment.slice(0, 15);
  
  console.log('=== Top 15 Firms to Enrich ===\n');
  top15.forEach((lead, idx) => {
    console.log(`${idx + 1}. Row ${lead.rowNum}: ${lead.company}`);
    console.log(`   Website: ${lead.website || '[NONE]'}`);
    console.log(`   Issue: ${lead.issue}`);
    console.log(`   Current Contact: ${lead.contact || '[EMPTY]'}`);
    console.log(`   Current Email: ${lead.email || '[EMPTY]'}`);
    console.log(`   Status: ${lead.status || '[NONE]'}`);
    console.log('');
  });
  
  // Save to file
  fs.writeFileSync(
    path.join(__dirname, 'enrichment-queue-march14-437pm.json'),
    JSON.stringify(top15, null, 2)
  );
  
  console.log(`\nSaved top 15 to enrichment-queue-march14-437pm.json`);
  console.log('\n📊 Summary:');
  console.log(`   Total firms: ${rows.length}`);
  console.log(`   Need enrichment: ${needsEnrichment.length}`);
  console.log(`   Selected for research: ${top15.length}\n`);
}

main().catch(console.error);
