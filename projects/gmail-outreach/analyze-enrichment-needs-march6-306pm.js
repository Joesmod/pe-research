const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

async function getClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function analyzeSheet() {
  const sheets = await getClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1',
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
  const websiteIdx = header.indexOf('Website');
  const linkedinIdx = header.indexOf('LinkedIn');

  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    const website = row[websiteIdx] || '';
    
    // Skip if already has valid contact and email
    const hasValidContact = contact && contact.trim() !== '';
    const hasValidEmail = email && 
                          !email.includes('info@') && 
                          !email.includes('sales@') && 
                          !email.includes('ir@') &&
                          !email.includes('@') === false;
    
    // Need enrichment if missing contact or has generic email
    if (company && (!hasValidContact || !hasValidEmail || email.trim() === '')) {
      needsEnrichment.push({
        rowIndex: i + 1,
        company,
        currentContact: contact,
        currentEmail: email,
        status,
        website
      });
    }
  }

  console.log(`\n=== ENRICHMENT ANALYSIS ===`);
  console.log(`Total rows: ${rows.length - 1}`);
  console.log(`Needs enrichment: ${needsEnrichment.length}\n`);
  
  // Show first 15
  console.log('First 15 leads needing enrichment:\n');
  needsEnrichment.slice(0, 15).forEach(lead => {
    console.log(`Row ${lead.rowIndex}: ${lead.company}`);
    console.log(`  Current Contact: ${lead.currentContact || 'EMPTY'}`);
    console.log(`  Current Email: ${lead.currentEmail || 'EMPTY'}`);
    console.log(`  Website: ${lead.website}`);
    console.log('');
  });

  // Save to file
  fs.writeFileSync(
    'enrichment-targets-march6-306pm.json',
    JSON.stringify(needsEnrichment.slice(0, 15), null, 2)
  );
  
  console.log('Saved to enrichment-targets-march6-306pm.json');
}

analyzeSheet().catch(err => {
  console.error(err);
  process.exit(1);
});
