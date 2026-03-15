const { google } = require('googleapis');

async function enrichPELeads() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Read current sheet data
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:L',
  });
  
  const rows = result.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  console.log('=== PE RESEARCH & ENRICHMENT - HOURLY RUN ===');
  console.log(`Time: ${new Date().toLocaleString()}`);
  console.log('');
  
  // Find leads needing enrichment
  const needsEnrichment = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const contactName = row[2] || '';
    const email = row[4] || '';
    const status = row[7] || '';
    
    if (!company) continue;
    
    const hasGenericEmail = email && email.match(/^(info|sales|ir|contact|hello|admin|compliance|press|careers)@/i);
    const needsWork = !contactName || !email || hasGenericEmail;
    
    if (needsWork && status !== 'Researched - No Public Email' && status !== 'Enriched') {
      needsEnrichment.push({
        rowIndex: i,
        company,
        contactName,
        email,
        status,
        hasGenericEmail
      });
    }
  }
  
  console.log(`Found ${needsEnrichment.length} leads needing enrichment`);
  console.log('');
  
  // Take first 10-15 for this run
  const toProcess = needsEnrichment.slice(0, 15);
  console.log(`Processing ${toProcess.length} leads this run:`);
  toProcess.forEach((lead, idx) => {
    console.log(`  ${idx+1}. Row ${lead.rowIndex+1}: ${lead.company} (${lead.status || 'No Status'})`);
  });
  console.log('');
  
  console.log('=== NEXT STEPS ===');
  console.log('For each firm, search:');
  console.log('1. Firm website team/contact pages');
  console.log('2. LinkedIn searches (site:linkedin.com "[firm name]" [title])');
  console.log('3. Press releases and news articles');
  console.log('4. Conference speaker bios');
  console.log('5. SEC filings (if publicly traded)');
  console.log('');
  console.log('Target roles:');
  console.log('- C-suite: CEO, CTO, COO, CMO, CFO');
  console.log('- Partners: Managing, Operating, General Partner');
  console.log('- Directors: Technology, Product, Operations, Marketing');
  console.log('- VPs: Technology, Operations, Digital Transformation');
  console.log('- Heads of: Value Creation, Portfolio Ops, BD');
  console.log('');
  
  // Return the list for manual processing
  return toProcess;
}

enrichPELeads()
  .then(leads => {
    if (leads && leads.length > 0) {
      console.log('Ready for manual enrichment via web search and Apollo.');
    }
  })
  .catch(console.error);
