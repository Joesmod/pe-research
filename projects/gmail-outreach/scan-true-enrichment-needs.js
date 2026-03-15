const { google } = require('googleapis');

async function scanTrueNeeds() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:N',
  });
  
  const rows = response.data.values;
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1;
    
    // Most common structure based on inspection:
    // A: empty or company name
    // B: company name or contact name (varies)
    // C: website or contact name
    // D: title or contact name
    // E: email or title
    // F: email or website
    // G: LinkedIn
    // H: Status
    // I: Enrichment status (the actual indicator)
    // J: Notes
    // K: Last contacted
    
    let companyName = '';
    let website = '';
    let contactName = '';
    let title = '';
    let email = '';
    let enrichmentStatus = row[8] || '';  // Column I
    
    // Skip if already marked as Enriched in column I
    if (enrichmentStatus && enrichmentStatus.toLowerCase() === 'enriched') {
      continue;
    }
    
    // Try to identify company name (usually B, sometimes A)
    if (row[0] && row[0].trim() !== '') {
      companyName = row[0];
      website = row[1] || '';
      contactName = row[2] || '';
      title = row[3] || '';
      email = row[4] || '';
    } else if (row[1] && row[1].trim() !== '') {
      companyName = row[1];
      
      // Check if row[2] looks like a URL (website)
      if (row[2] && (row[2].startsWith('http') || row[2].includes('.'))) {
        website = row[2];
        contactName = row[3] || '';
        title = row[4] || '';
        email = row[5] || '';
      } else {
        // row[2] is contact name
        contactName = row[2] || '';
        title = row[3] || '';
        email = row[4] || '';
        website = row[5] || '';
      }
    }
    
    // Skip completely empty rows
    if (!companyName || companyName.trim() === '') {
      continue;
    }
    
    // Check if genuinely needs enrichment
    const hasNoContact = !contactName || contactName.trim() === '';
    const hasNoEmail = !email || email.trim() === '';
    const hasGenericEmail = email && (
      email.includes('info@') ||
      email.includes('sales@') ||
      email.includes('ir@') ||
      email.includes('contact@') ||
      email.includes('admin@') ||
      email.includes('hello@') ||
      email.includes('general@')
    );
    
    if (hasNoContact || hasNoEmail || hasGenericEmail) {
      needsEnrichment.push({
        row: rowNum,
        company: companyName,
        website,
        contactName,
        title,
        email,
        enrichmentStatus,
        reason: hasNoContact ? 'Missing contact name' : 
                hasNoEmail ? 'Missing email' : 'Generic email only'
      });
    }
  }
  
  console.log(`\n=== FOUND ${needsEnrichment.length} LEADS GENUINELY NEEDING ENRICHMENT ===\n`);
  
  // Show first 15
  const batch = needsEnrichment.slice(0, 15);
  batch.forEach((lead, idx) => {
    console.log(`${idx + 1}. Row ${lead.row}: ${lead.company}`);
    console.log(`   Website: ${lead.website || '(none)'}`);
    console.log(`   Contact: ${lead.contactName || '(none)'}`);
    console.log(`   Title: ${lead.title || '(none)'}`);
    console.log(`   Email: ${lead.email || '(none)'}`);
    console.log(`   Reason: ${lead.reason}`);
    console.log('');
  });
  
  // Write to file for processing
  const fs = require('fs');
  fs.writeFileSync('enrichment-needs-march14-537am.json', JSON.stringify(batch, null, 2));
  
  console.log(`\n✅ Saved first 15 to enrichment-needs-march14-537am.json`);
  console.log(`Total leads needing enrichment: ${needsEnrichment.length}`);
}

scanTrueNeeds().catch(console.error);
