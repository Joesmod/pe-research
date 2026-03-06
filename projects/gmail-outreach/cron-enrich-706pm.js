const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = JSON.parse(fs.readFileSync('service-account.json'));

const auth = new google.auth.GoogleAuth({
  credentials: SERVICE_ACCOUNT,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

(async () => {
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read the sheet
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:L'
  });
  
  const rows = res.data.values || [];
  if (rows.length === 0) {
    console.log('No data found.');
    return;
  }

  const headers = rows[0];
  console.log('Headers:', headers);
  console.log('\n=== Analyzing leads needing enrichment ===\n');
  
  // Find columns
  const companyIdx = headers.indexOf('Company Name');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const statusIdx = headers.indexOf('Status');
  const titleIdx = headers.indexOf('Title');
  
  let needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    const title = row[titleIdx] || '';
    
    // Skip if already sent, dead, or replied
    if (status === 'Sent' || status.includes('Dead') || status === 'Replied') continue;
    
    // Check if needs enrichment
    const noContact = !contact || contact.trim() === '';
    const genericEmail = email.match(/^(info|contact|sales|ir|investor|media|press|admin|support)@/i);
    const noEmail = !email || email.trim() === '';
    
    if (noContact || genericEmail || noEmail) {
      needsEnrichment.push({
        row: i + 1,
        company,
        contact,
        email,
        title,
        status,
        reason: noContact ? 'No contact name' : (noEmail ? 'No email' : 'Generic email')
      });
    }
  }
  
  console.log(`Found ${needsEnrichment.length} leads needing enrichment:\n`);
  
  // Show first 15
  const toProcess = needsEnrichment.slice(0, 15);
  toProcess.forEach((lead, idx) => {
    console.log(`${idx + 1}. Row ${lead.row}: ${lead.company}`);
    console.log(`   Contact: ${lead.contact || '(empty)'}`);
    console.log(`   Email: ${lead.email || '(empty)'}`);
    console.log(`   Reason: ${lead.reason}`);
    console.log('');
  });
  
  // Save to file for processing
  fs.writeFileSync('enrichment-targets-706pm.json', JSON.stringify(toProcess, null, 2));
  console.log(`\nSaved ${toProcess.length} targets to enrichment-targets-706pm.json`);
})();
