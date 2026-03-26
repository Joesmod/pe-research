const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const RANGE = 'Sheet1!A:O';

async function getSheetData() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'service-account.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: RANGE,
  });

  return response.data.values;
}

async function main() {
  const rows = await getSheetData();
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = (row[0] || '').trim();
    const contact = (row[2] || '').trim();
    const email = (row[4] || '').trim();
    const status = (row[9] || '').trim();
    
    // Skip if no company
    if (!company) continue;
    
    // Skip if status is Dead, Sent, Replied, Scheduled, or Enriched
    if (['Dead', 'Sent', 'Replied', 'Scheduled', 'Enriched'].includes(status)) continue;
    
    // Check if needs enrichment:
    // 1. No contact name, OR
    // 2. No email, OR
    // 3. Generic email (info@, sales@, ir@, contact@, hello@, support@, admin@)
    const isGenericEmail = email && /^(info|sales|ir|contact|hello|support|admin|team|careers|media)@/i.test(email);
    const hasUrl = contact && (contact.startsWith('http') || contact.startsWith('www'));
    
    if (!contact || hasUrl || !email || isGenericEmail) {
      needsEnrichment.push({
        row: i + 1,
        company,
        contact,
        email,
        status,
        reason: (!contact || hasUrl) ? 'Missing/invalid contact' : (!email ? 'Missing email' : 'Generic email')
      });
    }
  }
  
  console.log(`Total firms needing enrichment: ${needsEnrichment.length}\n`);
  
  // Show first 20
  const top = needsEnrichment.slice(0, 20);
  console.log('First 20 targets for enrichment:\n');
  top.forEach((n, idx) => {
    console.log(`${idx + 1}. Row ${n.row}: ${n.company}`);
    console.log(`   Reason: ${n.reason}`);
    console.log(`   Current Contact: ${n.contact || '(none)'}`);
    console.log(`   Current Email: ${n.email || '(none)'}`);
    console.log('');
  });
  
  // Save to file
  fs.writeFileSync(
    path.join(__dirname, 'enrichment-targets-march15-607pm.json'),
    JSON.stringify(needsEnrichment, null, 2)
  );
  console.log(`\nSaved ${needsEnrichment.length} targets to enrichment-targets-march15-607pm.json`);
  
  return needsEnrichment;
}

main().catch(console.error);
