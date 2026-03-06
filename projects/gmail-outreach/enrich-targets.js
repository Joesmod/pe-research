const {google} = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

(async () => {
  const sheets = google.sheets({version: 'v4', auth});
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A:K'
  });
  
  const rows = res.data.values;
  const headers = rows[0];
  
  // Find firms needing enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const firmName = row[0] || '';
    const contactName = row[2] || '';
    const email = row[4] || '';
    const status = row[9] || '';
    
    // Skip if already enriched or dead
    if (status === 'Enriched' || status.startsWith('Dead')) continue;
    
    // Check if needs enrichment
    const hasGenericEmail = email.match(/^(info@|sales@|ir@|contact@|admin@)/i);
    const noContactName = !contactName || contactName === 'Jacob Zodikoff';
    const noEmail = !email;
    
    if (noContactName || noEmail || hasGenericEmail) {
      needsEnrichment.push({
        row: i + 1,
        firm: firmName,
        contactName,
        email,
        status,
        issue: noContactName ? 'No contact' : hasGenericEmail ? 'Generic email' : 'No email'
      });
    }
  }
  
  // Sort by priority (Partial status first, then by row)
  needsEnrichment.sort((a, b) => {
    if (a.status === 'Partial' && b.status !== 'Partial') return -1;
    if (b.status === 'Partial' && a.status !== 'Partial') return 1;
    return a.row - b.row;
  });
  
  // Output top 15
  console.log('TOP 15 ENRICHMENT TARGETS:\n');
  needsEnrichment.slice(0, 15).forEach((target, idx) => {
    console.log(`${idx + 1}. ${target.firm} (Row ${target.row})`);
    console.log(`   Issue: ${target.issue}`);
    console.log(`   Current: ${target.contactName || 'NONE'} / ${target.email || 'NONE'}`);
    console.log(`   Status: ${target.status}\n`);
  });
  
  console.log(`\nTotal needing enrichment: ${needsEnrichment.length}`);
})();
