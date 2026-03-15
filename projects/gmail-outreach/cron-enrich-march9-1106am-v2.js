const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

async function main() {
  console.log('📊 Reading Google Sheet...\n');
  
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read all data from the first sheet
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:M', // Adjust range as needed
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }

  console.log(`Total rows: ${rows.length}\n`);
  
  // Extract header row
  const headers = rows[0];
  console.log('Headers:', headers.join(', '));
  console.log('');
  
  // Find column indices
  const companyIdx = headers.findIndex(h => h === 'Company' || h === 'Company Name');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const statusIdx = headers.indexOf('Status');
  const websiteIdx = headers.findIndex(h => h === 'Website' || h === 'Domain');
  const notesIdx = headers.indexOf('Notes');
  
  console.log(`Column indices: Company=${companyIdx}, Contact=${contactIdx}, Email=${emailIdx}, Status=${statusIdx}\n`);

  // Find rows that need enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    const website = websiteIdx >= 0 ? (row[websiteIdx] || '') : '';
    
    if (!company || status === 'Dead' || status === 'Sent') continue;
    
    // Need enrichment if: no contact name OR generic/empty email
    const hasNoContact = !contact || contact.trim() === '';
    const hasGenericEmail = !email || 
                           email.includes('info@') || 
                           email.includes('sales@') || 
                           email.includes('ir@') ||
                           email.includes('contact@') ||
                           email.trim() === '';
    
    if (hasNoContact || hasGenericEmail) {
      needsEnrichment.push({
        rowNumber: i + 1,
        company: company,
        contact: contact,
        email: email,
        website: website,
        status: status,
        notes: notesIdx >= 0 ? (row[notesIdx] || '') : ''
      });
    }
  }

  console.log(`🔍 Found ${needsEnrichment.length} leads needing enrichment\n`);
  
  // Take first 15
  const batch = needsEnrichment.slice(0, 15);
  
  console.log('📋 Batch to enrich (15 leads):');
  batch.forEach((lead, idx) => {
    console.log(`${idx + 1}. ${lead.company} (Row ${lead.rowNumber})`);
    console.log(`   Current contact: ${lead.contact || '(empty)'}`);
    console.log(`   Current email: ${lead.email || '(empty)'}`);
    console.log(`   Website: ${lead.website || '(none)'}`);
    console.log('');
  });

  // Save to JSON for research
  fs.writeFileSync(
    path.join(__dirname, 'enrich-targets-march9-1106am.json'),
    JSON.stringify(batch, null, 2)
  );
  
  console.log('\n✅ Saved to enrich-targets-march9-1106am.json');
  console.log('\n📝 RESEARCH STRATEGY:');
  console.log('For each firm, search for decision-makers with these roles:');
  console.log('  • C-level: CEO, CTO, COO, CMO, CFO');
  console.log('  • Partners: Managing, Operating, General Partner');
  console.log('  • Directors: Technology, Product, Operations, Marketing, BD');
  console.log('  • VPs: Technology, Operations, Digital, Portfolio Ops');
  console.log('  • Heads: Value Creation, Portfolio Ops, Business Development');
  console.log('\nSearch methods:');
  console.log('  1. Firm website /team /about /leadership /contact pages');
  console.log('  2. site:linkedin.com "[Company Name]" (CEO|Partner|Director|VP)');
  console.log('  3. Press releases, conference bios, SEC filings');
  console.log('  4. Published PDFs/brochures on firm website');
  console.log('\nONLY use verified emails from official published sources!');
  console.log('NEVER guess email patterns or hallucinate.\n');
}

main().catch(console.error);
