const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = JSON.parse(fs.readFileSync('service-account.json', 'utf8'));

const auth = new google.auth.GoogleAuth({
  credentials: SERVICE_ACCOUNT,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

async function findLeadsNeedingEnrichment() {
  const sheets = google.sheets({ version: 'v4', auth });
  
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:K'
  });
  
  const rows = res.data.values || [];
  const header = rows[0];
  
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const contactName = row[2] || '';
    const email = row[4] || '';
    const status = row[9] || '';
    
    // Skip if already marked as dead or sent
    if (status.toLowerCase().includes('dead') || status.toLowerCase().includes('sent')) {
      continue;
    }
    
    // Check if needs enrichment
    const needsContact = !contactName.trim();
    const hasGenericEmail = email && (
      email.includes('info@') || 
      email.includes('sales@') || 
      email.includes('ir@') ||
      email.includes('contact@') ||
      email.includes('hello@') ||
      email.includes('admin@')
    );
    const hasNoEmail = !email.trim();
    
    if (needsContact || hasGenericEmail || hasNoEmail) {
      needsEnrichment.push({
        rowIndex: i,
        company,
        contactName,
        email,
        status,
        reason: needsContact ? 'No contact name' : (hasNoEmail ? 'No email' : 'Generic email')
      });
    }
  }
  
  console.log(`Found ${needsEnrichment.length} leads needing enrichment:`);
  console.log(JSON.stringify(needsEnrichment.slice(0, 15), null, 2));
  
  fs.writeFileSync('leads-needing-enrichment-706am.json', JSON.stringify(needsEnrichment, null, 2));
  
  return needsEnrichment;
}

findLeadsNeedingEnrichment().catch(console.error);
