const {google} = require('googleapis');
const fs = require('fs');
const key = require('./service-account.json');

const auth = new google.auth.GoogleAuth({
  credentials: key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

(async () => {
  const sheets = google.sheets({version: 'v4', auth: await auth.getClient()});
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A:J'
  });
  
  const rows = res.data.values || [];
  const header = rows[0];
  const data = rows.slice(1);
  
  // Find rows needing enrichment
  const needsEnrichment = [];
  
  data.forEach((row, idx) => {
    const company = row[0] || '';
    const contactName = row[2] || '';
    const email = row[4] || '';
    const status = row[9] || '';
    
    // Skip if already enriched or if no company name
    if (!company || status === 'Enriched' || status === 'Sent') {
      return;
    }
    
    // Check if needs enrichment: empty contact name or generic email
    const hasGenericEmail = email && (
      email.includes('info@') || 
      email.includes('sales@') || 
      email.includes('ir@') ||
      email.includes('contact@') ||
      email.includes('hello@')
    );
    
    const needsHelp = !contactName || !email || hasGenericEmail;
    
    if (needsHelp) {
      needsEnrichment.push({
        rowIndex: idx + 2, // +2 because of header and 1-based indexing
        company,
        contactName,
        email,
        status,
        reason: !contactName ? 'No contact name' : hasGenericEmail ? 'Generic email' : 'No email'
      });
    }
  });
  
  console.log(JSON.stringify(needsEnrichment.slice(0, 15), null, 2));
  fs.writeFileSync('enrichment-needs-1036am.json', JSON.stringify(needsEnrichment, null, 2));
  console.error(`\nTotal needing enrichment: ${needsEnrichment.length}`);
  console.error(`Showing first 15 for this run`);
})();
