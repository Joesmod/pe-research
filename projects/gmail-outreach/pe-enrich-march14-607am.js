const { google } = require('googleapis');
const fs = require('fs');

async function enrichPELeads() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Get all data - NO HEADERS, all rows are data
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:N',
  });
  
  const rows = response.data.values;
  
  console.log('=== SCANNING SHEET FOR ENRICHMENT NEEDS ===');
  console.log(`Total rows: ${rows.length}\n`);
  
  // Manual column mapping based on inspection
  const COL = {
    COMPANY: 0,
    WEBSITE: 1,
    CONTACT: 2,
    TITLE: 3,
    EMAIL: 4,
    WEBSITE2: 5,
    LINKEDIN: 6,
    STATUS: 7,
    NOTES: 8
  };
  
  const needsEnrichment = [];
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1;
    
    const company = (row[COL.COMPANY] || '').trim();
    const website = (row[COL.WEBSITE] || '').trim();
    const contact = (row[COL.CONTACT] || '').trim();
    const title = (row[COL.TITLE] || '').trim();
    const email = (row[COL.EMAIL] || '').trim();
    const status = (row[COL.STATUS] || '').trim();
    const notes = (row[COL.NOTES] || '').trim();
    
    // Skip completely empty rows
    if (!company) continue;
    
    // Skip if status indicates removal
    if (status.toLowerCase().includes('remove') || status.toLowerCase().includes('dead')) {
      continue;
    }
    
    // Check if needs enrichment:
    // 1. No contact name, OR
    // 2. Contact name is same as company (placeholder), OR
    // 3. No email, OR
    // 4. Generic email (info@, sales@, ir@, contact@, admin@)
    
    const hasNoContact = !contact || contact === company;
    const hasNoEmail = !email;
    const hasGenericEmail = email && (
      email.toLowerCase().includes('info@') ||
      email.toLowerCase().includes('sales@') ||
      email.toLowerCase().includes('ir@') ||
      email.toLowerCase().includes('contact@') ||
      email.toLowerCase().includes('admin@')
    );
    
    if (hasNoContact || hasNoEmail || hasGenericEmail) {
      needsEnrichment.push({
        row: rowNum,
        company,
        website,
        contact: contact || '(empty)',
        title: title || '(empty)',
        email: email || '(empty)',
        status,
        notes,
        reason: hasNoContact ? 'Missing contact name' : hasGenericEmail ? 'Generic email' : 'Missing email'
      });
    }
  }
  
  console.log(`Found ${needsEnrichment.length} leads needing enrichment\n`);
  
  // Select first 15 unique companies
  const seen = new Set();
  const batch = [];
  for (const lead of needsEnrichment) {
    if (!seen.has(lead.company)) {
      seen.add(lead.company);
      batch.push(lead);
      if (batch.length >= 15) break;
    }
  }
  
  console.log('=== TOP 15 UNIQUE FIRMS FOR ENRICHMENT ===\n');
  batch.forEach((lead, idx) => {
    console.log(`${idx + 1}. ${lead.company} (Row ${lead.row})`);
    console.log(`   Website: ${lead.website || '(none)'}`);
    console.log(`   Current Contact: ${lead.contact}`);
    console.log(`   Current Title: ${lead.title}`);
    console.log(`   Current Email: ${lead.email}`);
    console.log(`   Status: ${lead.status || '(none)'}`);
    console.log(`   Reason: ${lead.reason}`);
    console.log('');
  });
  
  // Save to file for manual research
  fs.writeFileSync(
    'pe-enrichment-targets-march14-607am.json',
    JSON.stringify(batch, null, 2)
  );
  
  console.log(`\n✅ Saved ${batch.length} targets to pe-enrichment-targets-march14-607am.json`);
  console.log('\n=== NEXT STEPS ===');
  console.log('1. Research each firm manually (team pages, LinkedIn, press releases)');
  console.log('2. Find decision-makers: Partners, MDs, VPs, Heads of ops/tech/digital');
  console.log('3. Verify emails from official sources (NO GUESSING)');
  console.log('4. Update sheet + GitHub dossiers');
  console.log('5. DO NOT send any emails\n');
  
  return batch;
}

enrichPELeads()
  .then(batch => {
    console.log(`Processing complete. Found ${batch.length} leads to research.`);
  })
  .catch(error => {
    console.error('ERROR:', error.message);
    process.exit(1);
  });
