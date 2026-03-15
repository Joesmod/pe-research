const { google } = require('googleapis');
const fs = require('fs');

async function readAndAnalyzeSheet() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
    
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A:K',
    });
    
    const rows = result.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found.');
      return;
    }
    
    const headers = rows[0];
    console.log('Headers:', headers);
    
    // Find column indices
    const companyIdx = headers.findIndex(h => h && h.toLowerCase().includes('company'));
    const contactIdx = headers.findIndex(h => h && h.toLowerCase().includes('contact'));
    const emailIdx = headers.findIndex(h => h && h.toLowerCase().includes('email'));
    const statusIdx = headers.findIndex(h => h && h.toLowerCase().includes('status'));
    
    console.log(`\nColumn indices: Company=${companyIdx}, Contact=${contactIdx}, Email=${emailIdx}, Status=${statusIdx}\n`);
    
    const needsEnrichment = [];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;
      
      const company = row[companyIdx] || '';
      const contact = row[contactIdx] || '';
      const email = row[emailIdx] || '';
      const status = row[statusIdx] || '';
      
      // Skip if status is Dead Lead or already Enriched
      if (status.toLowerCase().includes('dead') || status.toLowerCase() === 'enriched') {
        continue;
      }
      
      // Check if needs enrichment: empty contact OR generic email
      const needsContact = !contact || contact.trim() === '';
      const hasGenericEmail = email && (email.includes('info@') || email.includes('sales@') || email.includes('ir@') || email.includes('contact@'));
      
      if (needsContact || hasGenericEmail) {
        needsEnrichment.push({
          rowIndex: i + 1,
          company,
          contact,
          email,
          status,
          reason: needsContact ? 'Empty contact' : 'Generic email'
        });
      }
    }
    
    console.log(`\nFound ${needsEnrichment.length} leads needing enrichment:\n`);
    needsEnrichment.slice(0, 15).forEach(lead => {
      console.log(`Row ${lead.rowIndex}: ${lead.company} - ${lead.reason}`);
    });
    
    fs.writeFileSync('leads-needing-enrichment-406pm.json', JSON.stringify(needsEnrichment, null, 2));
    console.log(`\nSaved ${needsEnrichment.length} leads to leads-needing-enrichment-406pm.json`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

readAndAnalyzeSheet();
