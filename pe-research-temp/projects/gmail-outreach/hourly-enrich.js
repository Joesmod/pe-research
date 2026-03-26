const { google } = require('googleapis');
const fs = require('fs');

async function identifyEnrichmentTargets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Read the sheet
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:K',
  });
  
  const rows = response.data.values;
  const headers = rows[0];
  
  // Find column indices
  const companyCol = headers.indexOf('Company Name');
  const contactCol = headers.indexOf('Contact Name');
  const titleCol = headers.indexOf('Title');
  const emailCol = headers.indexOf('Email');
  const statusCol = headers.indexOf('Status');
  const notesCol = headers.indexOf('Notes');
  
  console.log('\n=== ENRICHMENT TARGETS (HOURLY CRON) ===\n');
  console.log(`Sheet has ${rows.length - 1} total rows\n`);
  
  const targets = [];
  
  // Skip header row
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyCol] || '';
    const contact = row[contactCol] || '';
    const email = row[emailCol] || '';
    const status = row[statusCol] || '';
    
    // Check if needs enrichment
    const needsContact = !contact || contact.trim() === '';
    const hasGenericEmail = email && (
      email.toLowerCase().includes('info@') ||
      email.toLowerCase().includes('sales@') ||
      email.toLowerCase().includes('ir@') ||
      email.toLowerCase().includes('contact@')
    );
    const noEmail = !email || email.trim() === '';
    
    if (needsContact || hasGenericEmail || noEmail) {
      targets.push({
        rowIndex: i + 1, // 1-indexed for Google Sheets
        company,
        contact,
        email,
        status,
        reason: needsContact ? 'Missing contact name' : 
                hasGenericEmail ? 'Generic email' : 
                'Missing email'
      });
    }
  }
  
  console.log(`Found ${targets.length} leads needing enrichment\n`);
  
  // Show first 15
  const toShow = targets.slice(0, 15);
  toShow.forEach((t, idx) => {
    console.log(`${idx + 1}. Row ${t.rowIndex}: ${t.company}`);
    console.log(`   Reason: ${t.reason}`);
    console.log(`   Current contact: ${t.contact || '(empty)'}`);
    console.log(`   Current email: ${t.email || '(empty)'}`);
    console.log(`   Status: ${t.status}\n`);
  });
  
  // Save to file
  fs.writeFileSync('enrichment-targets-hourly.json', JSON.stringify(targets, null, 2));
  console.log(`\nSaved ${targets.length} targets to enrichment-targets-hourly.json`);
  
  return targets;
}

identifyEnrichmentTargets().catch(console.error);
