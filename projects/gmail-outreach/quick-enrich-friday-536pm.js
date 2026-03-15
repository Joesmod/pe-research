// Quick Enrichment Script - March 6, 2026, 5:36 PM
const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = 'service-account.json';

// Setup auth
const auth = new google.auth.GoogleAuth({
  keyFile: SERVICE_ACCOUNT_FILE,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

async function identifyNeedsEnrichment() {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:Z1000',
  });

  const rows = response.data.values;
  const header = rows[0];
  const needs = [];

  // Find column indices
  const companyIdx = header.indexOf('Company');
  const contactIdx = header.indexOf('Contact Name');
  const emailIdx = header.indexOf('Email');
  const statusIdx = header.indexOf('Status');
  const websiteIdx = header.indexOf('Website');

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = (row[emailIdx] || '').toLowerCase();
    const status = row[statusIdx] || '';
    const website = row[websiteIdx] || '';

    // Skip if enriched, dead, or already has good contact
    if (status === 'Enriched' || status === 'Dead' || status === 'Dead Lead' || 
        status.includes('Dead')) continue;
    
    // Check if needs enrichment
    const hasGenericEmail = email.startsWith('info@') || email.startsWith('sales@') || 
                            email.startsWith('ir@') || email.startsWith('contact@') ||
                            email === '';
    const needsContact = !contact || contact.trim() === '';

    if ((hasGenericEmail || needsContact) && company) {
      needs.push({
        row: i + 1,
        company,
        contact: contact || '(none)',
        email: email || '(none)',
        website,
        status
      });
    }
  }

  return needs;
}

async function main() {
  console.log('=== PE ENRICHMENT - Friday 5:36 PM ===\n');
  
  const needsEnrichment = await identifyNeedsEnrichment();
  
  console.log(`Found ${needsEnrichment.length} firms needing enrichment\n`);
  console.log('Top 15 candidates:\n');
  
  needsEnrichment.slice(0, 15).forEach((firm, idx) => {
    console.log(`${idx + 1}. Row ${firm.row}: ${firm.company}`);
    console.log(`   Contact: ${firm.contact}`);
    console.log(`   Email: ${firm.email}`);
    console.log(`   Status: ${firm.status}`);
    console.log(`   Website: ${firm.website}\n`);
  });

  // Save to file
  fs.writeFileSync(
    'enrichment-targets-friday-536pm.json',
    JSON.stringify(needsEnrichment.slice(0, 15), null, 2)
  );

  console.log('\nSaved targets to enrichment-targets-friday-536pm.json');
}

main().catch(console.error);
