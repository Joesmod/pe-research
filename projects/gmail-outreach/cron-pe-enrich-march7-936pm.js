const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

(async () => {
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  
  // Read current data
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:M'
  });
  
  const rows = res.data.values;
  const headers = rows[0];
  
  console.log('Headers:', headers);
  console.log(`\nTotal rows: ${rows.length - 1}`);
  
  // Find indices
  const companyIdx = headers.indexOf('Company');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const titleIdx = headers.indexOf('Title');
  const linkedinIdx = headers.indexOf('LinkedIn URL');
  const statusIdx = headers.indexOf('Status');
  const notesIdx = headers.indexOf('Notes');
  
  // Find leads needing enrichment (skip header row)
  const needsEnrichment = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    
    // Skip if already enriched, sent, or dead
    if (['Enriched', 'Sent', 'Dead'].includes(status)) continue;
    
    // Check if needs enrichment: empty contact OR empty/generic email
    const needsContact = !contact || contact.trim() === '';
    const needsEmail = !email || email.trim() === '' || 
                      email.includes('info@') || 
                      email.includes('sales@') ||
                      email.includes('ir@') ||
                      email.includes('contact@');
    
    if (needsContact || needsEmail) {
      needsEnrichment.push({
        rowIndex: i,
        company,
        contact,
        email,
        reason: needsContact ? 'No contact' : 'Generic/empty email'
      });
    }
  }
  
  console.log(`\nLeads needing enrichment: ${needsEnrichment.length}`);
  console.log('\nFirst 15 to enrich:');
  needsEnrichment.slice(0, 15).forEach((lead, idx) => {
    console.log(`${idx + 1}. ${lead.company} (Row ${lead.rowIndex + 1}) - ${lead.reason}`);
    console.log(`   Current: ${lead.contact} <${lead.email}>\n`);
  });
  
  // Save to file for reference
  const fs = require('fs');
  fs.writeFileSync(
    'enrich-targets-march7-936pm.json',
    JSON.stringify(needsEnrichment.slice(0, 15), null, 2)
  );
  
})().catch(console.error);
