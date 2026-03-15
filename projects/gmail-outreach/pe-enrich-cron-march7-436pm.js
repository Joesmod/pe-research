const { google } = require('googleapis');
const fs = require('fs');

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

(async () => {
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  
  // Read the sheet
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:L'
  });
  
  const rows = res.data.values || [];
  if (rows.length === 0) {
    console.log('No data found');
    return;
  }

  const headers = rows[0];
  console.log('Headers:', headers);
  
  // Find indices for key columns
  const companyIdx = headers.indexOf('Company');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const statusIdx = headers.indexOf('Status');
  const websiteIdx = headers.indexOf('Website');
  
  console.log('\n=== Column Indices ===');
  console.log(`Company: ${companyIdx}, Contact: ${contactIdx}, Email: ${emailIdx}, Status: ${statusIdx}, Website: ${websiteIdx}`);
  
  // Scan for leads needing enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    const website = row[websiteIdx] || '';
    
    // Skip if status is Sent, Dead, or Enriched
    if (status === 'Sent' || status === 'Dead' || status === 'Enriched') continue;
    
    // Check if needs enrichment
    const noContact = !contact || contact.trim() === '';
    const genericEmail = email.match(/^(info@|sales@|ir@|contact@|admin@)/i);
    const noEmail = !email || email.trim() === '';
    
    if (noContact || genericEmail || noEmail) {
      needsEnrichment.push({
        rowIndex: i + 1, // 1-based for Google Sheets
        company,
        contact,
        email,
        status,
        website,
        reason: noContact ? 'Missing contact' : (noEmail ? 'Missing email' : 'Generic email')
      });
    }
  }
  
  console.log(`\n=== Found ${needsEnrichment.length} leads needing enrichment ===\n`);
  
  // Take first 10-15
  const targets = needsEnrichment.slice(0, 15);
  
  targets.forEach((t, idx) => {
    console.log(`${idx + 1}. Row ${t.rowIndex}: ${t.company}`);
    console.log(`   Contact: ${t.contact || '(empty)'}`);
    console.log(`   Email: ${t.email || '(empty)'}`);
    console.log(`   Reason: ${t.reason}`);
    console.log(`   Website: ${t.website || '(none)'}\n`);
  });
  
  // Save to JSON
  fs.writeFileSync('enrich-targets-march7-436pm.json', JSON.stringify(targets, null, 2));
  console.log(`\nSaved ${targets.length} targets to enrich-targets-march7-436pm.json`);
  
})().catch(console.error);
