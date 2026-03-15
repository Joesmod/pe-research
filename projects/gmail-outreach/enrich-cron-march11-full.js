const { google } = require('googleapis');
const fs = require('fs');

async function enrichPEFirms() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Read current sheet data
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:K'
  });
  
  const rows = response.data.values;
  console.log('Headers:', rows[0]);
  console.log(`\nTotal rows: ${rows.length}`);
  
  // Find firms needing enrichment
  const needsEnrichment = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const firm = row[0];
    const contact = row[2];
    const email = row[4];
    const website = row[5];
    const status = row[9];
    
    // Skip dead/inactive firms
    if (status && (status.toLowerCase().includes('dead') || status.toLowerCase().includes('inactive') || status.toLowerCase().includes('sent'))) {
      continue;
    }
    
    // Check if needs enrichment
    const hasNoContact = !contact || contact.trim() === '';
    const hasNoEmail = !email || email.trim() === '' || !email.includes('@');
    const hasGenericEmail = email && (
      email.toLowerCase().includes('info@') || 
      email.toLowerCase().includes('sales@') || 
      email.toLowerCase().includes('ir@') ||
      email.toLowerCase().includes('contact@') ||
      email.toLowerCase().includes('marketing@')
    );
    
    if (hasNoContact || hasNoEmail || hasGenericEmail) {
      let reason = [];
      if (hasNoContact) reason.push('NO_CONTACT');
      if (hasNoEmail) reason.push('NO_EMAIL');
      if (hasGenericEmail) reason.push('GENERIC_EMAIL');
      
      needsEnrichment.push({
        rowNum: i + 1,
        firm: firm || 'Unknown',
        contact: contact || '',
        email: email || '',
        website: website || '',
        status: status || '',
        reason: reason.join(', '),
        row: row
      });
    }
  }
  
  console.log(`\n====================`);
  console.log(`FOUND ${needsEnrichment.length} firms needing enrichment`);
  console.log(`====================\n`);
  
  // Sort by priority: empty contact + email first
  needsEnrichment.sort((a, b) => {
    const aEmpty = (!a.contact && !a.email) ? 0 : 1;
    const bEmpty = (!b.contact && !b.email) ? 0 : 1;
    return aEmpty - bEmpty;
  });
  
  const top15 = needsEnrichment.slice(0, 15);
  console.log('TOP 15 PRIORITY TARGETS:\n');
  top15.forEach((item, idx) => {
    console.log(`${idx + 1}. Row ${item.rowNum}: ${item.firm}`);
    console.log(`   Contact: ${item.contact || 'EMPTY'}`);
    console.log(`   Email: ${item.email || 'EMPTY'}`);
    console.log(`   Website: ${item.website || 'NO WEBSITE'}`);
    console.log(`   Reason: ${item.reason}`);
    console.log(`   Status: ${item.status || 'None'}`);
    console.log('');
  });
  
  // Save to file for manual research
  fs.writeFileSync('enrichment-targets-march11.json', JSON.stringify(top15, null, 2));
  console.log(`\nSaved top 15 targets to enrichment-targets-march11.json`);
  console.log(`Total needing enrichment: ${needsEnrichment.length}`);
}

enrichPEFirms().catch(console.error);
