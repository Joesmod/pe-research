const { google } = require('googleapis');
const fs = require('fs');

async function enrichLeads() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Read sheet
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:J',
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  const headers = rows[0];
  console.log('Headers:', headers);
  
  // Find indices
  const companyIdx = headers.indexOf('Company Name');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const statusIdx = headers.indexOf('Status');
  
  console.log(`\nColumn indices: Company=${companyIdx}, Contact=${contactIdx}, Email=${emailIdx}, Status=${statusIdx}`);
  
  // Find leads needing enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    
    // Skip if already sent or dead
    if (status.toLowerCase().includes('sent') || status.toLowerCase().includes('dead')) {
      continue;
    }
    
    // Needs enrichment if: no contact OR no email OR generic email
    const hasNoContact = !contact || contact.trim() === '';
    const hasNoEmail = !email || email.trim() === '';
    const hasGenericEmail = email && (email.includes('info@') || email.includes('sales@') || email.includes('ir@') || email.includes('contact@'));
    
    if (hasNoContact || hasNoEmail || hasGenericEmail) {
      needsEnrichment.push({
        rowIndex: i + 1, // 1-indexed
        company,
        contact,
        email,
        status,
        reason: hasNoContact ? 'no_contact' : (hasGenericEmail ? 'generic_email' : 'no_email')
      });
    }
  }
  
  console.log(`\n=== ENRICHMENT TARGETS (${needsEnrichment.length} total) ===\n`);
  
  // Sort by priority: no contact first, then generic email, then no email
  needsEnrichment.sort((a, b) => {
    const priority = { no_contact: 1, generic_email: 2, no_email: 3 };
    return priority[a.reason] - priority[b.reason];
  });
  
  // Show first 15
  const targets = needsEnrichment.slice(0, 15);
  targets.forEach((t, idx) => {
    console.log(`${idx + 1}. ${t.company}`);
    console.log(`   Row: ${t.rowIndex}`);
    console.log(`   Contact: ${t.contact || '(empty)'}`);
    console.log(`   Email: ${t.email || '(empty)'}`);
    console.log(`   Reason: ${t.reason}`);
    console.log('');
  });
  
  // Save to file
  fs.writeFileSync('enrich-targets-march7-1136pm.json', JSON.stringify(targets, null, 2));
  console.log(`\nSaved ${targets.length} targets to enrich-targets-march7-1136pm.json`);
}

enrichLeads().catch(console.error);
