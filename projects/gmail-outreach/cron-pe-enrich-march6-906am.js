const {google} = require('googleapis');
const fs = require('fs');

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

(async () => {
  try {
    const sheets = google.sheets({version: 'v4', auth});
    
    // Read the sheet
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:K'
    });
    
    const rows = res.data.values || [];
    if (rows.length === 0) {
      console.log('No data found in sheet');
      return;
    }
    
    const header = rows[0];
    const data = rows.slice(1);
    
    // Map columns
    const colCompany = 0;
    const colNotebookLM = 1;
    const colContactName = 2;
    const colTitle = 3;
    const colEmail = 4;
    const colWebsite = 5;
    const colLinkedIn = 6;
    const colSector = 7;
    const colPortfolio = 8;
    const colStatus = 9;
    const colLastContacted = 10;
    
    // Find leads needing enrichment
    const needsEnrichment = [];
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const company = row[colCompany] || '';
      const contactName = row[colContactName] || '';
      const email = row[colEmail] || '';
      const status = row[colStatus] || '';
      
      // Skip if already marked as Dead, Bounced, or Sent
      if (status.includes('Dead') || status.includes('Bounced') || status.includes('Sent')) {
        continue;
      }
      
      // Check if needs enrichment
      const emptyContact = !contactName || contactName.trim() === '';
      const genericEmail = email.match(/^(info@|sales@|ir@|contact@|hello@|support@)/i);
      const emptyEmail = !email || email.trim() === '';
      
      if (emptyContact || genericEmail || emptyEmail) {
        needsEnrichment.push({
          rowIndex: i + 2, // +2 because: +1 for header, +1 for 1-indexed
          company: company,
          contactName: contactName,
          email: email,
          website: row[colWebsite] || '',
          linkedin: row[colLinkedIn] || '',
          status: status,
          reason: emptyContact ? 'No contact name' : (emptyEmail ? 'No email' : 'Generic email')
        });
      }
    }
    
    console.log(`\n=== PE ENRICHMENT CRON - March 6, 2026 9:06 AM ===`);
    console.log(`Total rows in sheet: ${data.length}`);
    console.log(`Leads needing enrichment: ${needsEnrichment.length}`);
    console.log(`\nFirst 15 leads to enrich:\n`);
    
    const toEnrich = needsEnrichment.slice(0, 15);
    toEnrich.forEach((lead, idx) => {
      console.log(`${idx + 1}. ${lead.company} (Row ${lead.rowIndex})`);
      console.log(`   Reason: ${lead.reason}`);
      console.log(`   Current: ${lead.contactName || '(empty)'} / ${lead.email || '(empty)'}`);
      console.log(`   Website: ${lead.website}`);
      console.log(`   Status: ${lead.status}`);
      console.log('');
    });
    
    // Save to JSON
    fs.writeFileSync('leads-needing-enrichment-906am.json', JSON.stringify(toEnrich, null, 2));
    console.log(`\nSaved ${toEnrich.length} leads to leads-needing-enrichment-906am.json`);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
