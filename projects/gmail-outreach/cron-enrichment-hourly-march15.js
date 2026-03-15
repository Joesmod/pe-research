const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');

async function run() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_FILE,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Read the sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:O'
    });
    
    const rows = response.data.values || [];
    if (rows.length === 0) {
      console.log('No data found in sheet.');
      return;
    }
    
    const headers = rows[0];
    console.log('Headers:', headers);
    
    const companyIdx = headers.indexOf('Company/Firm');
    const contactIdx = headers.indexOf('Contact Name');
    const titleIdx = headers.indexOf('Position/Title');
    const emailIdx = headers.indexOf('Email');
    const statusIdx = headers.indexOf('Status');
    const linkedinIdx = headers.indexOf('LinkedIn URL');
    const notesIdx = headers.indexOf('Notes');
    
    const needsEnrichment = [];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const company = row[companyIdx] || '';
      const contact = row[contactIdx] || '';
      const email = row[emailIdx] || '';
      const status = (row[statusIdx] || '').toLowerCase();
      
      if (status === 'dead' || status === 'researched - dead' || status === 'closed') continue;
      
      const needsWork = !contact || 
                       !email || 
                       email.includes('@info') ||
                       email.includes('@sales') ||
                       email.includes('@ir') ||
                       email.includes('@contact');
      
      if (needsWork && company) {
        needsEnrichment.push({
          rowNum: i + 1,
          company,
          contact: contact || '(empty)',
          email: email || '(empty)',
          status: row[statusIdx] || ''
        });
      }
    }
    
    console.log(`\nFound ${needsEnrichment.length} leads needing enrichment:\n`);
    needsEnrichment.slice(0, 15).forEach(lead => {
      console.log(`Row ${lead.rowNum}: ${lead.company} | Contact: ${lead.contact} | Email: ${lead.email}`);
    });
    
    return needsEnrichment;
    
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

run().then(results => {
  console.log(`\n✅ Scan complete. ${results?.length || 0} leads need enrichment.`);
  process.exit(0);
}).catch(err => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
