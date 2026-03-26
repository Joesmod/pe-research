const { google } = require('googleapis');
const fs = require('fs');

async function readSheet() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: './projects/gmail-outreach/service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
    
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A:N',
    });
    
    const rows = result.data.values || [];
    console.log(`Total rows: ${rows.length}`);
    
    if (rows.length > 0) {
      const headers = rows[0];
      console.log('\nHeaders:', headers);
      
      // Find leads needing enrichment (empty Contact Name or generic email)
      const needsEnrichment = [];
      
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const company = row[0] || '';
        const contactName = row[2] || '';
        const email = row[4] || '';
        const status = row[9] || '';
        
        // Skip if already enriched or contacted
        if (status.toLowerCase().includes('contact') || status.toLowerCase() === 'enriched') {
          continue;
        }
        
        // Check if needs enrichment
        const hasEmptyContact = !contactName || contactName.trim() === '';
        const hasGenericEmail = email && (
          email.toLowerCase().includes('info@') ||
          email.toLowerCase().includes('sales@') ||
          email.toLowerCase().includes('ir@') ||
          email.toLowerCase().includes('contact@')
        );
        
        if (hasEmptyContact || hasGenericEmail) {
          needsEnrichment.push({
            row: i + 1,
            company,
            contactName,
            email,
            status,
            website: row[5] || '',
            reason: hasEmptyContact ? 'Empty contact name' : 'Generic email'
          });
        }
      }
      
      console.log(`\nLeads needing enrichment: ${needsEnrichment.length}`);
      console.log('\nFirst 15 leads to enrich:');
      needsEnrichment.slice(0, 15).forEach(lead => {
        console.log(`${lead.company} | ${lead.contactName || '(empty)'} | ${lead.email || '(empty)'} | ${lead.reason}`);
      });
      
      // Save to file for further processing
      fs.writeFileSync('./projects/gmail-outreach/enrichment-targets-cron.json', JSON.stringify(needsEnrichment, null, 2));
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

readSheet();
