/**
 * Find leads with empty contacts or generic emails - March 17, 11:37 PM
 * Manual scan to understand what needs enrichment
 */

const { google } = require('googleapis');
const path = require('path');

const CRM_SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

const GENERIC_PATTERNS = /^(info|contact|sales|ir|investor\.relations|investorrelations|hello|support|admin|general|inquiries)@/i;

async function findNeedsEnrichment() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read all of Sheet1
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: CRM_SHEET_ID,
    range: 'Sheet1!A:O',
  });
  
  const rows = res.data.values || [];
  
  console.log(`Total rows: ${rows.length}\n`);
  
  // Skip row 0 (seems to be mixed header/data)
  // Assume structure from row 1 onwards:
  // A=Company, B=Website, C=Contact, D=Title, E=Email, F=?, G=LinkedIn, H=?, I=Notes, J=Status
  
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    
    const company = (row[0] || '').trim();
    const website = (row[1] || '').trim();
    const contact = (row[2] || '').trim();
    const title = (row[3] || '').trim();
    const email = (row[4] || '').trim();
    const status = (row[9] || '').trim();
    
    // Skip if no company or dead/sent
    if (!company || status.toLowerCase() === 'dead' || status.toLowerCase() === 'sent') {
      continue;
    }
    
    // Check if needs enrichment
    const hasEmptyContact = !contact || contact === '';
    const hasNoEmail = !email || email === '';
    const hasGenericEmail = email && GENERIC_PATTERNS.test(email);
    
    const needsEnrich = (hasEmptyContact || hasNoEmail || hasGenericEmail) && website;
    
    if (needsEnrich) {
      needsEnrichment.push({
        rowIndex: i,
        company,
        website,
        contact,
        title,
        email,
        status,
        reason: hasEmptyContact ? 'Empty contact' : (hasNoEmail ? 'No email' : 'Generic email'),
      });
    }
  }
  
  console.log(`Found ${needsEnrichment.length} leads needing enrichment:\n`);
  
  // Show first 20
  needsEnrichment.slice(0, 20).forEach(lead => {
    console.log(`Row ${lead.rowIndex + 1}: ${lead.company}`);
    console.log(`  Website: ${lead.website || '(none)'}`);
    console.log(`  Contact: ${lead.contact || '(EMPTY)'}`);
    console.log(`  Email: ${lead.email || '(EMPTY)'}`);
    console.log(`  Status: ${lead.status}`);
    console.log(`  Reason: ${lead.reason}`);
    console.log('');
  });
  
  console.log(`\nTotal needing enrichment: ${needsEnrichment.length}`);
  console.log(`Will enrich first 15 in next run.`);
  
  // Save to file
  const fs = require('fs');
  fs.writeFileSync(
    path.join(__dirname, 'enrichment-candidates-march17-11pm.json'),
    JSON.stringify(needsEnrichment, null, 2)
  );
  
  return needsEnrichment;
}

findNeedsEnrichment().catch(console.error);
