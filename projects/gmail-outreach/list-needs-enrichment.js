const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const credentials = JSON.parse(fs.readFileSync('service-account.json', 'utf8'));

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

async function listNeedsEnrichment() {
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:J'
  });
  
  const rows = response.data.values;
  const header = rows[0];
  
  console.log('Header:', header);
  console.log('\nLeads needing enrichment (empty Contact Name or generic email):\n');
  
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1;
    
    const company = row[0] || '';
    const aum = row[1] || '';
    const contactName = row[2] || '';
    const title = row[3] || '';
    const email = row[4] || '';
    const website = row[5] || '';
    const linkedin = row[6] || '';
    const sectors = row[7] || '';
    const notes = row[8] || '';
    const status = row[9] || '';
    
    // Check if needs enrichment
    const hasNoContact = !contactName || contactName.trim() === '';
    const hasGenericEmail = email && (
      email.includes('info@') || 
      email.includes('sales@') || 
      email.includes('ir@') ||
      email.includes('contact@') ||
      email.includes('general@')
    );
    const hasNoEmail = !email || email.trim() === '';
    
    if (hasNoContact || hasGenericEmail || hasNoEmail) {
      needsEnrichment.push({
        row: rowNum,
        company,
        aum,
        contactName,
        email,
        website,
        status,
        reason: hasNoContact ? 'No contact' : hasGenericEmail ? 'Generic email' : 'No email'
      });
    }
  }
  
  // Show first 20
  needsEnrichment.slice(0, 20).forEach(item => {
    console.log(`Row ${item.row}: ${item.company} (${item.aum})`);
    console.log(`  Contact: ${item.contactName || '(empty)'}`);
    console.log(`  Email: ${item.email || '(empty)'}`);
    console.log(`  Website: ${item.website || '(empty)'}`);
    console.log(`  Status: ${item.status || '(empty)'}`);
    console.log(`  Reason: ${item.reason}`);
    console.log('');
  });
  
  console.log(`\nTotal needing enrichment: ${needsEnrichment.length}`);
  console.log(`Showing first 20`);
}

listNeedsEnrichment().catch(console.error);
