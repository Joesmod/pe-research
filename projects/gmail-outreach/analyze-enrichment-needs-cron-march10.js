const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

async function getClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function analyzeEnrichmentNeeds() {
  const sheets = await getClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:P500',
  });
  
  const rows = res.data.values || [];
  if (rows.length === 0) {
    console.log('No data found');
    return;
  }
  
  const header = rows[0];
  const companyIdx = header.indexOf('Company Name');
  const contactIdx = header.indexOf('Contact Name');
  const emailIdx = header.indexOf('Email');
  const statusIdx = header.indexOf('Status');
  
  console.log(`Found ${rows.length - 1} total rows\n`);
  
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    
    // Skip if already marked as Dead or certain statuses
    if (status.includes('Dead') || status.includes('DUPLICATE')) {
      continue;
    }
    
    // Check if needs enrichment
    const noContact = !contact || contact.trim() === '';
    const genericEmail = email && (
      email.includes('info@') || 
      email.includes('sales@') || 
      email.includes('ir@') ||
      email.includes('contact@') ||
      email.includes('hello@') ||
      email === ''
    );
    const wrongDomain = email && company && !email.toLowerCase().includes(company.toLowerCase().split(' ')[0].toLowerCase().substring(0, 5));
    
    if (noContact || genericEmail || !email) {
      needsEnrichment.push({
        row: i + 1,
        company,
        contact,
        email,
        status,
        issue: noContact ? 'No Contact Name' : (genericEmail ? 'Generic Email' : 'No Email')
      });
    }
  }
  
  console.log(`\n=== ENRICHMENT NEEDED: ${needsEnrichment.length} leads ===\n`);
  
  // Show first 15
  const toShow = needsEnrichment.slice(0, 15);
  toShow.forEach(lead => {
    console.log(`Row ${lead.row}: ${lead.company}`);
    console.log(`  Contact: ${lead.contact || '(empty)'}`);
    console.log(`  Email: ${lead.email || '(empty)'}`);
    console.log(`  Issue: ${lead.issue}`);
    console.log(`  Status: ${lead.status}`);
    console.log('');
  });
  
  if (needsEnrichment.length > 15) {
    console.log(`... and ${needsEnrichment.length - 15} more\n`);
  }
  
  // Save to JSON
  const fs = require('fs');
  fs.writeFileSync(
    path.join(__dirname, 'enrichment-targets-march10-1036pm.json'),
    JSON.stringify(needsEnrichment, null, 2)
  );
  
  console.log(`Full list saved to: enrichment-targets-march10-1036pm.json`);
}

analyzeEnrichmentNeeds().catch(console.error);
