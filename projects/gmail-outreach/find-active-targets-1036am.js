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
  
  // Find rows needing enrichment (active firms only)
  const needsEnrichment = [];
  
  data.forEach((row, idx) => {
    const company = row[0] || '';
    const contactName = row[2] || '';
    const email = row[4] || '';
    const status = row[9] || '';
    
    // Skip if no company name
    if (!company) return;
    
    // Skip if already enriched or sent
    if (status === 'Enriched' || status === 'Sent') return;
    
    // Skip if marked as Dead
    if (status.toLowerCase().includes('dead')) return;
    
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
        rowIndex: idx + 2,
        company,
        website: row[1] || row[5] || '', // NotebookLM or Website column
        contactName,
        title: row[3] || '',
        email,
        linkedin: row[6] || '',
        status,
        reason: !contactName ? 'No contact name' : hasGenericEmail ? 'Generic email' : 'No email'
      });
    }
  });
  
  console.log(JSON.stringify(needsEnrichment.slice(0, 15), null, 2));
  fs.writeFileSync('active-enrichment-targets-1036am.json', JSON.stringify(needsEnrichment, null, 2));
  console.error(`\nTotal active firms needing enrichment: ${needsEnrichment.length}`);
  console.error(`Will process first 15 in this run`);
})();
