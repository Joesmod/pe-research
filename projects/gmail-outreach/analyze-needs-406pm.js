// Quick script to identify enrichment needs
const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:N', // All columns
  });
  
  const rows = response.data.values || [];
  const headers = rows[0];
  
  // Find column indices
  const companyCol = headers.indexOf('Company Name');
  const contactCol = headers.indexOf('Contact Name');
  const emailCol = headers.indexOf('Email');
  const statusCol = headers.indexOf('Status');
  
  console.log(`Headers: ${headers.join(' | ')}`);
  console.log(`\nColumn indices: Company=${companyCol}, Contact=${contactCol}, Email=${emailCol}, Status=${statusCol}`);
  
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyCol] || '';
    const contact = row[contactCol] || '';
    const email = row[emailCol] || '';
    const status = row[statusCol] || '';
    
    // Skip if status includes "Dead", "Duplicate"
    if (status.includes('Dead') || status.includes('Duplicate')) continue;
    
    // Check if needs enrichment:
    // - Empty contact name
    // - Empty email
    // - Generic email (info@, sales@, ir@, contact@, admin@)
    const genericPatterns = ['info@', 'sales@', 'ir@', 'contact@', 'admin@'];
    const hasGenericEmail = genericPatterns.some(p => email.toLowerCase().includes(p));
    
    if (!contact || !email || hasGenericEmail) {
      needsEnrichment.push({
        row: i + 1,
        company,
        contact,
        email,
        status
      });
    }
  }
  
  console.log(`\n=== ENRICHMENT NEEDS (${needsEnrichment.length} firms) ===\n`);
  
  // Take first 15
  const batch = needsEnrichment.slice(0, 15);
  batch.forEach(firm => {
    console.log(`Row ${firm.row}: ${firm.company}`);
    console.log(`  Contact: "${firm.contact}" | Email: "${firm.email}" | Status: ${firm.status}`);
    console.log('');
  });
  
  console.log(`\n=== TOP 15 PRIORITY FOR ENRICHMENT ===`);
  console.log(JSON.stringify(batch, null, 2));
}

main().catch(console.error);
