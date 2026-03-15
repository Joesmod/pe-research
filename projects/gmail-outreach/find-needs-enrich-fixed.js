const { google } = require('googleapis');

async function findNeedsEnrichment() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:L',
  });
  
  const rows = result.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  console.log(`📊 Total rows: ${rows.length}\n`);
  console.log('First row (should be OpenGate Capital):');
  console.log(`  Company: ${rows[0][0]}`);
  console.log(`  Contact: ${rows[0][2]}`);
  console.log(`  Email: ${rows[0][4]}`);
  console.log(`  Status: ${rows[0][7]}\n`);
  
  const needsEnrichment = [];
  let enrichedCount = 0;
  
  // Start from index 0 (row 1 in the sheet)
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const website = row[1] || '';
    const contactName = row[2] || '';
    const title = row[3] || '';
    const email = row[4] || '';
    const linkedin = row[6] || '';
    const status = row[7] || '';
    const notes = row[8] || '';
    
    // Skip truly empty rows
    if (!company.trim()) continue;
    
    // Check if needs enrichment
    const hasGenericEmail = email && email.toLowerCase().match(/^(info|sales|ir|contact|hello|admin|investor|team|support)@/);
    const missingContact = !contactName || contactName.trim() === '';
    const missingEmail = !email || email.trim() === '';
    
    if ((missingContact || missingEmail || hasGenericEmail) && status !== 'Enriched') {
      needsEnrichment.push({
        rowIndex: i,
        sheetRow: i + 1,
        company,
        website,
        contactName,
        title,
        email,
        status,
        notes
      });
    } else if (status === 'Enriched') {
      enrichedCount++;
    }
  }
  
  console.log(`✅ Already enriched: ${enrichedCount}`);
  console.log(`🔍 Need enrichment: ${needsEnrichment.length}\n`);
  
  if (needsEnrichment.length === 0) {
    console.log('All leads are enriched!');
    return;
  }
  
  // Show first 15
  console.log('📋 Top 15 leads needing enrichment:\n');
  needsEnrichment.slice(0, 15).forEach(lead => {
    console.log(`Row ${lead.sheetRow}: ${lead.company}`);
    console.log(`  Website: ${lead.website}`);
    console.log(`  Contact: '${lead.contactName}'`);
    console.log(`  Email: '${lead.email}'`);
    console.log(`  Status: '${lead.status}'`);
    console.log('');
  });
  
  // Save to file for reference
  const fs = require('fs');
  fs.writeFileSync(
    'enrichment-targets-cron.json',
    JSON.stringify(needsEnrichment, null, 2)
  );
  console.log(`💾 Saved ${needsEnrichment.length} targets to enrichment-targets-cron.json`);
}

findNeedsEnrichment().catch(console.error);
