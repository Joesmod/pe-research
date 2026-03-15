const { google } = require('googleapis');

async function findCandidates() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:M'
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found');
    return;
  }
  
  console.log('=== ENRICHMENT CANDIDATES ===\n');
  let count = 0;
  const targets = [];
  
  for (let i = 1; i < rows.length && count < 15; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const contact = row[2] || '';
    const title = row[3] || '';
    const email = row[4] || '';
    const website = row[5] || '';
    const linkedin = row[6] || '';
    const status = row[9] || '';
    const notes = row[11] || '';
    
    // Skip if Dead/Sent/Replied
    const skipStatuses = ['dead', 'sent', 'replied', 'contacted', 'duplicate'];
    if (skipStatuses.some(s => status.toLowerCase().includes(s))) {
      continue;
    }
    
    // Target these for enrichment:
    // 1. Status contains "New - Unresearched"
    // 2. Status contains "Partial"
    // 3. Status contains "Research" (but not enriched)
    // 4. Empty contact name
    // 5. Generic email (info@, sales@, ir@, contact@)
    // 6. No email
    
    const needsEnrichment = 
      status.toLowerCase().includes('unresearched') ||
      status.toLowerCase().includes('partial') ||
      (status.toLowerCase().includes('research') && !status.toLowerCase().includes('enriched')) ||
      !contact || contact.trim() === '' ||
      !email || email.trim() === '' ||
      email.startsWith('info@') ||
      email.startsWith('sales@') ||
      email.startsWith('ir@') ||
      email.startsWith('contact@');
    
    if (needsEnrichment) {
      const target = {
        row: i + 1,
        company,
        contact,
        title,
        email,
        website,
        linkedin,
        status,
        notes,
        priority: status.toLowerCase().includes('unresearched') ? 'HIGH' : 'MEDIUM'
      };
      
      targets.push(target);
      
      console.log(`${count + 1}. Row ${i + 1}: ${company}`);
      console.log(`   Contact: ${contact || '[EMPTY]'}`);
      console.log(`   Email: ${email || '[EMPTY]'}`);
      console.log(`   Website: ${website || '[EMPTY]'}`);
      console.log(`   Status: ${status || '[NEW]'}`);
      console.log(`   Priority: ${target.priority}`);
      console.log('');
      count++;
    }
  }
  
  console.log(`\nTotal candidates found: ${count}`);
  
  const fs = require('fs');
  fs.writeFileSync('enrichment-targets.json', JSON.stringify(targets, null, 2));
  console.log('\nSaved to enrichment-targets.json');
  
  return targets;
}

findCandidates().catch(console.error);
