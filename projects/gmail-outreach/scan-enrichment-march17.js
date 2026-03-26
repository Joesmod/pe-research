/**
 * Scan Google Sheet for leads needing enrichment
 * Find rows with empty Contact Name (col C) or generic/empty Email (col E)
 */

const { google } = require('googleapis');
const path = require('path');

const CRM_SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

const GENERIC_PATTERNS = /^(info|contact|sales|ir|investor\.relations|hello|support|admin|general|inquiries)@/i;

async function scanSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: CRM_SHEET_ID,
    range: 'Sheet1!A:N',  // Company Name through Gumbo Score
  });
  
  const rows = res.data.values || [];
  
  console.log(`📊 Total rows: ${rows.length}\n`);
  console.log(`Headers: ${rows[0].join(' | ')}\n`);
  
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] || [];
    
    const company = (row[0] || '').trim();  // A: Company Name
    const website = (row[1] || '').trim();  // B: NotebookLM / Website
    const contact = (row[2] || '').trim();  // C: Contact Name
    const title = (row[3] || '').trim();    // D: Title
    const email = (row[4] || '').trim();    // E: Email
    const status1 = (row[7] || '').trim();  // H: Status
    const status2 = (row[9] || '').trim();  // J: Status
    
    // Skip if company is empty or status is "Dead" or "Sent"
    const statusLower = (status1 + ' ' + status2).toLowerCase();
    if (!company || statusLower.includes('dead') || statusLower.includes('sent')) {
      continue;
    }
    
    // Check if needs enrichment
    const emptyContact = !contact;
    const emptyEmail = !email;
    const genericEmail = email && GENERIC_PATTERNS.test(email);
    
    if ((emptyContact || emptyEmail || genericEmail) && website) {
      needsEnrichment.push({
        rowNum: i + 1,  // 1-indexed for display
        company,
        website,
        contact: contact || '(empty)',
        title: title || '(empty)',
        email: email || '(empty)',
        status: status1 || status2 || '(empty)',
        issue: emptyContact ? 'Missing Contact' : genericEmail ? 'Generic Email' : 'Missing Email',
      });
    }
  }
  
  console.log(`🎯 Found ${needsEnrichment.length} leads needing enrichment:\n`);
  
  // Show first 20
  needsEnrichment.slice(0, 20).forEach(lead => {
    console.log(`Row ${lead.rowNum}: ${lead.company}`);
    console.log(`  Issue: ${lead.issue}`);
    console.log(`  Current: ${lead.contact} (${lead.title}) - ${lead.email}`);
    console.log(`  Website: ${lead.website}`);
    console.log(`  Status: ${lead.status}\n`);
  });
  
  if (needsEnrichment.length > 20) {
    console.log(`... and ${needsEnrichment.length - 20} more\n`);
  }
  
  // Save to JSON for the enrichment script
  const fs = require('fs');
  fs.writeFileSync(
    path.join(__dirname, 'enrichment-targets-march17.json'),
    JSON.stringify(needsEnrichment, null, 2)
  );
  
  console.log(`💾 Saved ${needsEnrichment.length} targets to enrichment-targets-march17.json`);
}

scanSheet().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
