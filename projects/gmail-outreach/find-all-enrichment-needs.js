const { google } = require('googleapis');

async function findEnrichmentNeeds() {
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
    
    // Identify company name (could be in column A or B)
    let companyName = row[0] || '';
    let website = row[1] || '';
    let contactName = row[2] || '';
    let title = row[3] || '';
    let email = row[4] || '';
    let altEmail = row[5] || '';
    let status = row[7] || '';
    
    // If column A is empty but B has content, it's a misaligned "New Lead" format
    if (!companyName && website) {
      companyName = website;  // B has the firm name
      website = contactName;  // C has the website
      contactName = '';       // D would be contact name (empty)
      email = title || '';    // E would be email (empty)
      altEmail = email;       // F might have generic email
    }
    
    // Skip completely empty rows
    if (!companyName || companyName.trim() === '') {
      continue;
    }
    
    // Skip if already marked as "Enriched"
    if (status && status.toLowerCase() === 'enriched') {
      continue;
    }
    
    // Check if needs enrichment
    const hasNoContact = !contactName || contactName.trim() === '';
    const hasNoEmail = (!email || email.trim() === '') && (!altEmail || altEmail.trim() === '');
    const hasGenericEmail = (email && (
      email.includes('info@') ||
      email.includes('sales@') ||
      email.includes('ir@') ||
      email.includes('contact@') ||
      email.includes('admin@')
    )) || (altEmail && (
      altEmail.includes('info@') ||
      altEmail.includes('sales@') ||
      altEmail.includes('ir@') ||
      altEmail.includes('contact@') ||
      altEmail.includes('admin@')
    ));
    
    if (hasNoContact || hasNoEmail || hasGenericEmail) {
      needsEnrichment.push({
        row: rowNum,
        company: companyName,
        website,
        contactName,
        email: email || altEmail,
        status,
        reason: hasNoContact ? 'Missing contact' : hasGenericEmail ? 'Generic email only' : 'No email'
      });
    }
  }
  
  console.log(`\n=== FOUND ${needsEnrichment.length} LEADS NEEDING ENRICHMENT ===\n`);
  
  // Show first 20
  const batch = needsEnrichment.slice(0, 20);
  batch.forEach((lead, idx) => {
    console.log(`${idx + 1}. Row ${lead.row}: ${lead.company}`);
    console.log(`   Website: ${lead.website}`);
    console.log(`   Contact: ${lead.contactName || '(none)'}`);
    console.log(`   Email: ${lead.email || '(none)'}`);
    console.log(`   Status: ${lead.status}`);
    console.log(`   Reason: ${lead.reason}`);
    console.log('');
  });
  
  return needsEnrichment;
}

findEnrichmentNeeds()
  .then(leads => {
    console.log(`\n✅ Total leads needing enrichment: ${leads.length}`);
    console.log(`Will process up to 15 in this cron run.`);
  })
  .catch(console.error);
