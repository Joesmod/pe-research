const { google } = require('googleapis');

(async () => {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A:K'
    });
    
    const rows = response.data.values || [];
    const header = rows[0];
    const dataRows = rows.slice(1);
    
    // Find rows needing enrichment
    const needsEnrichment = dataRows.filter((r, idx) => {
      const company = r[0] || '';
      const website = r[1] || '';
      const contact = r[2] || '';
      const email = r[4] || '';
      const status = r[9] || '';
      
      // Skip Dead/fully enriched
      if (status.includes('Dead')) return false;
      if (status === 'Enriched' && contact && email && !email.match(/^(info@|sales@|ir@|team@|contact@|admin@)/i) && contact !== 'Jacob Zodikoff') return false;
      
      // Priority targets: Partial, New, Active with missing/generic contact
      const needsContact = !contact || contact === 'Jacob Zodikoff';
      const needsEmail = !email || email.match(/^(info@|sales@|ir@|team@|contact@|admin@)/i);
      
      if ((status === 'Partial' || status === 'New - Unresearched' || status === 'Active' || !status) && (needsContact || needsEmail)) {
        return true;
      }
      
      return false;
    }).slice(0, 15);
    
    console.log('=== PRIORITY ENRICHMENT TARGETS (Top 15) ===\n');
    needsEnrichment.forEach((r, idx) => {
      console.log(`${idx + 1}. ${r[0]}`);
      console.log(`   Website: ${r[1] || '(none)'}`);
      console.log(`   Contact: ${r[2] || '(EMPTY)'}`);
      console.log(`   Email: ${r[4] || '(EMPTY)'}`);
      console.log(`   Status: ${r[9] || '(empty)'}`);
      console.log('');
    });
    
    console.log(`\nTotal needing enrichment: ${needsEnrichment.length}`);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
