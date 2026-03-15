const { google } = require('googleapis');

async function enrichLeads() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Read the sheet
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:N',
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  const headers = rows[0];
  console.log('Headers:', headers);
  
  // Find rows that need enrichment
  const needsEnrichment = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const companyName = row[0] || '';
    const contactName = row[2] || '';
    const email = row[4] || '';
    const status = row[9] || '';
    
    // Skip if already contacted or sent
    if (status.toLowerCase().includes('contacted') || status.toLowerCase().includes('sent')) {
      continue;
    }
    
    // Need enrichment if:
    // 1. No contact name
    // 2. No email
    // 3. Generic email (info@, sales@, ir@, media@, contact@)
    const genericEmailPattern = /^(info|sales|ir|media|contact|press|deals|team|hello|support)@/i;
    const hasGenericEmail = email && genericEmailPattern.test(email);
    
    if (!contactName || !email || hasGenericEmail) {
      needsEnrichment.push({
        rowIndex: i,
        companyName,
        contactName,
        email,
        website: row[5] || '',
        status,
        reason: !contactName ? 'No contact name' : (!email ? 'No email' : 'Generic email')
      });
    }
  }
  
  console.log(`\nFound ${needsEnrichment.length} leads needing enrichment:\n`);
  
  // Show first 15
  const batch = needsEnrichment.slice(0, 15);
  batch.forEach((lead, idx) => {
    console.log(`${idx + 1}. ${lead.companyName}`);
    console.log(`   Contact: ${lead.contactName || 'MISSING'}`);
    console.log(`   Email: ${lead.email || 'MISSING'} (${lead.reason})`);
    console.log(`   Row: ${lead.rowIndex + 1}`);
    console.log('');
  });
  
  console.log(`\nNext step: Manual research for these 15 firms to find:`);
  console.log(`- Decision-maker names (C-level, Partners, Directors, VPs)`);
  console.log(`- Direct emails from firm websites, LinkedIn, press releases`);
  console.log(`- NO GUESSING email patterns - only verified sources\n`);
  
  // Save targets to file
  const fs = require('fs');
  fs.writeFileSync('enrich-targets-march7-736am.json', JSON.stringify(batch, null, 2));
  console.log('✓ Saved targets to enrich-targets-march7-736am.json');
}

enrichLeads().catch(console.error);
