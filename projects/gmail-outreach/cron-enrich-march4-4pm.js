const { google } = require('googleapis');
const key = require('./service-account.json');

async function enrichLeads() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Read current sheet
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:J'
  });
  
  const rows = result.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  // Headers: Company Name, NotebookLM, Contact Name, Title, Email, Website, LinkedIn, Sector Focus, Portfolio Companies
  const headers = rows[0];
  console.log('Headers:', headers);
  
  // Find leads needing enrichment
  const needsEnrichment = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const contactName = row[2] || '';
    const email = row[4] || '';
    const website = row[5] || '';
    
    // Check if needs enrichment: empty contact name OR empty/generic email
    const hasEmptyContact = !contactName || contactName.trim() === '';
    const hasGenericEmail = !email || email.includes('info@') || email.includes('sales@') || email.includes('ir@') || email.includes('contact@');
    
    if ((hasEmptyContact || hasGenericEmail) && company) {
      needsEnrichment.push({
        rowIndex: i,
        company,
        website,
        contactName,
        email
      });
    }
  }
  
  console.log(`\nFound ${needsEnrichment.length} leads needing enrichment:`);
  needsEnrichment.slice(0, 15).forEach((lead, idx) => {
    console.log(`\n${idx + 1}. ${lead.company}`);
    console.log(`   Contact: ${lead.contactName || '(empty)'}`);
    console.log(`   Email: ${lead.email || '(empty)'}`);
    console.log(`   Website: ${lead.website}`);
    console.log(`   Row: ${lead.rowIndex + 1}`);
  });
  
  return needsEnrichment.slice(0, 15);
}

enrichLeads().catch(console.error);
