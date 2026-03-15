const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const key = JSON.parse(fs.readFileSync('service-account.json'));

const auth = new google.auth.GoogleAuth({
  credentials: key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

(async () => {
  try {
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Read the sheet
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:N',
    });
    
    const rows = res.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found.');
      return;
    }
    
    const headers = rows[0];
    const companyIdx = headers.indexOf('Company');
    const contactIdx = headers.indexOf('Contact Name');
    const emailIdx = headers.indexOf('Email');
    const statusIdx = headers.indexOf('Status');
    
    console.log(`Headers: ${headers.join(', ')}`);
    console.log(`Total rows: ${rows.length}`);
    
    // Find leads that need enrichment
    const needsEnrichment = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const company = row[companyIdx] || '';
      const contact = row[contactIdx] || '';
      const email = row[emailIdx] || '';
      const status = row[statusIdx] || '';
      
      // Skip if already sent or dead
      if (status.toLowerCase().includes('sent') || 
          status.toLowerCase().includes('dead') ||
          status.toLowerCase().includes('replied')) {
        continue;
      }
      
      // Need enrichment if: no contact name OR generic/empty email
      const hasGenericEmail = email.match(/^(info@|sales@|ir@|contact@)/i);
      const needsEnrich = !contact || !email || hasGenericEmail;
      
      if (needsEnrich && company) {
        needsEnrichment.push({
          rowIndex: i + 1,
          company: company,
          contact: contact,
          email: email,
          status: status
        });
      }
    }
    
    console.log(`\nLeads needing enrichment: ${needsEnrichment.length}`);
    console.log(JSON.stringify(needsEnrichment.slice(0, 15), null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
