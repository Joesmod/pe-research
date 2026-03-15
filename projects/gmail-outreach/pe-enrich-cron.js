const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const credentials = JSON.parse(fs.readFileSync('service-account.json'));

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

(async () => {
  try {
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Read the sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'A:J'
    });
    
    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found.');
      return;
    }
    
    const headers = rows[0];
    console.log('=== SHEET HEADERS ===');
    console.log(headers.join(' | '));
    console.log('');
    
    // Find columns
    const companyIdx = headers.findIndex(h => h.toLowerCase().includes('company') || h.toLowerCase().includes('firm'));
    const contactIdx = headers.findIndex(h => h.toLowerCase().includes('contact') && h.toLowerCase().includes('name'));
    const emailIdx = headers.findIndex(h => h.toLowerCase().includes('email'));
    const statusIdx = headers.findIndex(h => h.toLowerCase().includes('status'));
    
    console.log(`Company: col ${companyIdx}, Contact: col ${contactIdx}, Email: col ${emailIdx}, Status: col ${statusIdx}`);
    console.log('');
    
    // Find leads needing enrichment
    const needsEnrichment = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const company = row[companyIdx] || '';
      const contact = row[contactIdx] || '';
      const email = row[emailIdx] || '';
      const status = row[statusIdx] || '';
      
      // Skip if status is Dead, Sent, Replied, etc.
      if (status.match(/dead|sent|replied|bounced/i)) continue;
      
      // Check if needs enrichment
      const hasNoContact = !contact || contact.trim() === '';
      const hasGenericEmail = email.match(/^(info@|sales@|ir@|contact@|hello@)/i);
      const hasNoEmail = !email || email.trim() === '';
      
      if (hasNoContact || hasGenericEmail || hasNoEmail) {
        needsEnrichment.push({
          row: i + 1,
          company,
          contact,
          email,
          status,
          reason: hasNoContact ? 'No Contact' : (hasGenericEmail ? 'Generic Email' : 'No Email')
        });
      }
    }
    
    console.log(`=== NEEDS ENRICHMENT: ${needsEnrichment.length} leads ===`);
    console.log('');
    
    // Show first 20
    needsEnrichment.slice(0, 20).forEach(lead => {
      console.log(`Row ${lead.row}: ${lead.company} | ${lead.reason}`);
      console.log(`  Contact: ${lead.contact || '(empty)'}`);
      console.log(`  Email: ${lead.email || '(empty)'}`);
      console.log(`  Status: ${lead.status}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
