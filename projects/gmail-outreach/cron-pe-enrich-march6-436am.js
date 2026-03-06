const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = JSON.parse(fs.readFileSync('service-account.json'));

async function main() {
  const auth = new google.auth.GoogleAuth({
    credentials: SERVICE_ACCOUNT,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read the sheet
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'PE Prospects!A:K'
  });
  
  const rows = response.data.values || [];
  if (rows.length === 0) {
    console.log('No data found in sheet.');
    return;
  }
  
  const headers = rows[0];
  const firmIdx = headers.indexOf('Firm');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const statusIdx = headers.indexOf('Status');
  
  console.log(`Found columns: Firm=${firmIdx}, Contact=${contactIdx}, Email=${emailIdx}, Status=${statusIdx}`);
  
  // Find rows needing enrichment
  const needsEnrichment = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const firm = row[firmIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    
    // Skip if no firm name
    if (!firm.trim()) continue;
    
    // Skip if already enriched or has dead/sent status
    if (status.toLowerCase().includes('enriched') ||
        status.toLowerCase().includes('dead') ||
        status.toLowerCase().includes('sent')) {
      continue;
    }
    
    // Check if needs enrichment: empty contact OR generic email
    const isGenericEmail = /^(info@|sales@|ir@|investor|contact@|hello@)/i.test(email);
    if (!contact.trim() || !email.trim() || isGenericEmail) {
      needsEnrichment.push({
        rowIndex: i + 1,
        firm,
        contact,
        email,
        status
      });
    }
  }
  
  console.log(`\nFound ${needsEnrichment.length} leads needing enrichment\n`);
  
  // Take first 15
  const targets = needsEnrichment.slice(0, 15);
  
  console.log('TARGET FIRMS FOR ENRICHMENT:\n');
  targets.forEach((t, idx) => {
    console.log(`${idx + 1}. ${t.firm} (Row ${t.rowIndex})`);
    console.log(`   Current: ${t.contact || '(empty)'} / ${t.email || '(empty)'}`);
    console.log(`   Status: ${t.status || '(empty)'}\n`);
  });
  
  // Save to file for reference
  fs.writeFileSync('enrichment-needs-march6-436am.json', JSON.stringify(targets, null, 2));
  
  console.log(`\nSaved ${targets.length} targets to enrichment-needs-march6-436am.json`);
}

main().catch(console.error);
