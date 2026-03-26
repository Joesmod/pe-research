/**
 * Find firms with empty Contact Name OR empty/generic Email
 */

const { google } = require('googleapis');
const path = require('path');

const CRM_SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

const GENERIC_PATTERNS = /^(info|contact|sales|ir|investor\.relations|hello|support|admin|general|inquiries)@/i;

async function findEmpty() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: CRM_SHEET_ID,
    range: 'Sheet1!A:N',
  });
  
  const rows = res.data.values || [];
  
  console.log(`📊 Total rows: ${rows.length}\n`);
  
  const needsEnrichment = [];
  
  // Skip row 0 (headers) and row 1 (partial header/data mix), start from row 2
  for (let i = 2; i < rows.length; i++) {
    const row = rows[i] || [];
    
    const company = (row[0] || '').trim();  // A
    const website = (row[1] || '').trim();  // B
    const contact = (row[2] || '').trim();  // C
    const title = (row[3] || '').trim();    // D
    const email = (row[4] || '').trim();    // E
    const status1 = (row[7] || '').trim();  // H
    const status2 = (row[9] || '').trim();  // J
    
    if (!company) continue;
    
    // Skip if status includes "Dead" or "Sent"
    const statusLower = (status1 + ' ' + status2).toLowerCase();
    if (statusLower.includes('dead') || statusLower.includes('sent')) {
      continue;
    }
    
    // Check if needs enrichment
    const emptyContact = !contact;
    const emptyEmail = !email;
    const genericEmail = email && GENERIC_PATTERNS.test(email);
    
    if (emptyContact || emptyEmail || genericEmail) {
      needsEnrichment.push({
        rowNum: i + 1,  // 1-indexed for display
        rowIndex: i,    // 0-indexed for API
        company,
        website,
        contact: contact || '(empty)',
        title: title || '(empty)',
        email: email || '(empty)',
        status: status1 || status2 || '(empty)',
        issue: emptyContact ? 'Empty Contact' : genericEmail ? 'Generic Email' : 'Empty Email',
      });
    }
  }
  
  console.log(`🎯 Found ${needsEnrichment.length} leads needing enrichment\n`);
  
  // Show first 25
  needsEnrichment.slice(0, 25).forEach(lead => {
    console.log(`Row ${lead.rowNum}: ${lead.company}`);
    console.log(`  Issue: ${lead.issue}`);
    console.log(`  Current Contact: ${lead.contact}`);
    console.log(`  Current Email: ${lead.email}`);
    console.log(`  Website: ${lead.website || '(no website)'}\n`);
  });
  
  if (needsEnrichment.length > 25) {
    console.log(`... and ${needsEnrichment.length - 25} more\n`);
  }
  
  // Save to JSON
  const fs = require('fs');
  fs.writeFileSync(
    path.join(__dirname, 'enrichment-targets-march17.json'),
    JSON.stringify(needsEnrichment, null, 2)
  );
  
  console.log(`💾 Saved ${needsEnrichment.length} targets to enrichment-targets-march17.json`);
}

findEmpty().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
