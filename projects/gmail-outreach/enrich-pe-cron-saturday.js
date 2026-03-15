const { google } = require('googleapis');

async function enrichPELeads() {
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
  
  console.log(`📊 Total rows in sheet: ${rows.length}`);
  console.log(`📋 Starting from row 2 (skipping header row 1)\n`);
  
  const needsEnrichment = [];
  let enrichedCount = 0;
  let totalFirms = 0;
  
  // Start from index 1 (row 2 in the sheet), skipping header row
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const website = row[1] || '';
    const contactName = row[2] || '';
    const title = row[3] || '';
    const email = row[4] || '';
    const linkedin = row[6] || '';
    const status = row[7] || '';
    
    // Skip truly empty rows
    if (!company.trim()) continue;
    
    totalFirms++;
    
    // Check if needs enrichment
    const hasGenericEmail = email && email.toLowerCase().match(/^(info|sales|ir|contact|hello|admin|investor|team|support)@/);
    const missingContact = !contactName || contactName.trim() === '';
    const missingEmail = !email || email.trim() === '';
    
    const needsWork = (missingContact || missingEmail || hasGenericEmail) && status !== 'Enriched';
    
    if (needsWork) {
      needsEnrichment.push({
        rowIndex: i,
        sheetRow: i + 1,
        company,
        website,
        contactName,
        title,
        email,
        status
      });
    } else if (status === 'Enriched') {
      enrichedCount++;
    }
  }
  
  console.log(`✅ Total PE firms: ${totalFirms}`);
  console.log(`✅ Already enriched: ${enrichedCount}`);
  console.log(`🔍 Need enrichment: ${needsEnrichment.length}\n`);
  
  if (needsEnrichment.length === 0) {
    console.log('🎉 All leads are enriched!');
    return;
  }
  
  // Show first 15
  const toEnrich = needsEnrichment.slice(0, 15);
  console.log(`📋 Top ${toEnrich.length} leads to enrich:\n`);
  
  toEnrich.forEach((lead, idx) => {
    console.log(`${idx + 1}. Row ${lead.sheetRow}: ${lead.company}`);
    console.log(`   Website: ${lead.website}`);
    console.log(`   Contact: '${lead.contactName}'`);
    console.log(`   Email: '${lead.email}'`);
    console.log(`   Status: '${lead.status}'`);
    console.log('');
  });
  
  // Save to file
  const fs = require('fs');
  fs.writeFileSync(
    'pe-enrichment-targets-saturday.json',
    JSON.stringify(needsEnrichment, null, 2)
  );
  console.log(`💾 Saved ${needsEnrichment.length} targets to pe-enrichment-targets-saturday.json`);
  
  return needsEnrichment;
}

enrichPELeads().catch(console.error);
