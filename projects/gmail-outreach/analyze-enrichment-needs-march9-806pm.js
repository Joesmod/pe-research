const { google } = require('googleapis');
const key = require('./service-account.json');

async function analyzeEnrichmentNeeds() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A:J',
  });
  
  const rows = response.data.values;
  const headers = rows[0];
  const data = rows.slice(1);
  
  console.log('=== LEADS NEEDING ENRICHMENT ===\n');
  
  let needsEnrichment = [];
  
  data.forEach((row, idx) => {
    const company = row[0] || '';
    const contactName = row[2] || '';
    const email = row[4] || '';
    const status = row[9] || '';
    
    // Skip if already marked as Dead or if enrichment in progress
    if (status.toLowerCase().includes('dead')) return;
    if (status.toLowerCase() === 'enriched') return;
    
    // Check if needs enrichment
    const needsContact = !contactName || contactName.trim() === '';
    const hasGenericEmail = email && (email.includes('info@') || email.includes('sales@') || email.includes('ir@') || email.includes('contact@'));
    const noEmail = !email || email.trim() === '';
    
    if (needsContact || hasGenericEmail || noEmail) {
      needsEnrichment.push({
        rowNumber: idx + 2, // +2 because of header and 0-indexing
        company,
        contactName,
        email,
        status,
        reason: needsContact ? 'No Contact Name' : (hasGenericEmail ? 'Generic Email' : 'No Email')
      });
    }
  });
  
  // Show first 20 needing enrichment
  console.log(`Total leads needing enrichment: ${needsEnrichment.length}\n`);
  console.log('First 20 targets:\n');
  
  needsEnrichment.slice(0, 20).forEach(lead => {
    console.log(`Row ${lead.rowNumber}: ${lead.company}`);
    console.log(`  Current Contact: ${lead.contactName || 'EMPTY'}`);
    console.log(`  Current Email: ${lead.email || 'EMPTY'}`);
    console.log(`  Reason: ${lead.reason}`);
    console.log(`  Status: ${lead.status}`);
    console.log('');
  });
}

analyzeEnrichmentNeeds().catch(console.error);
