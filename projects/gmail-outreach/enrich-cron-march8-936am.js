const { google } = require('googleapis');
const fs = require('fs');

async function enrichLeads() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
    
    // Read the sheet
    console.log('\n📊 Reading PE Research Tracker...');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A:K'
    });
    
    const rows = response.data.values || [];
    console.log(`Found ${rows.length} total rows`);
    
    // Identify rows needing enrichment
    const needsEnrichment = [];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const firm = row[0] || '';
      const contactName = row[2] || '';
      const email = row[4] || '';
      const status = row[9] || '';
      
      // Skip if already Dead or status indicates completion
      if (status === 'Dead' || status === 'Enriched' || status === 'Sent') continue;
      
      // Need enrichment if:
      // 1. No contact name, OR
      // 2. No email, OR
      // 3. Generic email (info@, sales@, ir@, contact@)
      const hasGenericEmail = email && (
        email.toLowerCase().startsWith('info@') ||
        email.toLowerCase().startsWith('sales@') ||
        email.toLowerCase().startsWith('ir@') ||
        email.toLowerCase().startsWith('contact@')
      );
      
      if (!contactName || !email || hasGenericEmail) {
        needsEnrichment.push({
          rowIndex: i + 1,
          firm,
          contactName,
          email,
          status,
          reason: !contactName ? 'Missing contact' : hasGenericEmail ? 'Generic email' : 'Missing email'
        });
      }
    }
    
    console.log(`\n✅ Found ${needsEnrichment.length} leads needing enrichment`);
    console.log('\nTop 15 targets:');
    needsEnrichment.slice(0, 15).forEach((lead, idx) => {
      console.log(`${idx + 1}. Row ${lead.rowIndex}: ${lead.firm} - ${lead.reason}`);
    });
    
    // Save targets for processing
    fs.writeFileSync(
      'enrich-targets-march8-936am.json',
      JSON.stringify(needsEnrichment.slice(0, 15), null, 2)
    );
    
    console.log('\n✅ Targets saved to enrich-targets-march8-936am.json');
    console.log('\n🔍 Now researching contacts for these firms...');
    
    // For now, just output the report
    return needsEnrichment.slice(0, 15);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

enrichLeads().then(() => {
  console.log('\n✅ Analysis complete');
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
