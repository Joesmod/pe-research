const { google } = require('googleapis');

async function readSheet() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A:K'
    });
    
    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found.');
      return;
    }
    
    // Print header
    console.log('Headers:', rows[0]);
    console.log(`\nTotal rows: ${rows.length - 1}`);
    
    // Find leads needing enrichment
    const needsEnrichment = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const firm = row[0] || '';
      const contactName = row[2] || '';
      const email = row[4] || '';
      const status = row[9] || '';
      
      // Check if needs enrichment: empty contact name or generic email
      const hasGenericEmail = email && (email.toLowerCase().startsWith('info@') || 
                                        email.toLowerCase().startsWith('sales@') || 
                                        email.toLowerCase().startsWith('ir@') ||
                                        email.toLowerCase().startsWith('contact@'));
      const needsEnrich = !contactName || hasGenericEmail || !email;
      
      if (needsEnrich && status !== 'Dead Lead') {
        needsEnrichment.push({
          row: i + 1,
          firm,
          contactName,
          email,
          status
        });
      }
    }
    
    console.log(`\nLeads needing enrichment: ${needsEnrichment.length}`);
    console.log('\nFirst 20 needing enrichment:');
    needsEnrichment.slice(0, 20).forEach(lead => {
      console.log(`Row ${lead.row}: ${lead.firm} | Contact: "${lead.contactName}" | Email: "${lead.email}" | Status: "${lead.status}"`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

readSheet();
