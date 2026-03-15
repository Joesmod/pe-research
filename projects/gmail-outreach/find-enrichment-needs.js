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
  const headers = rows[0];
  
  console.log('=== LEADS NEEDING ENRICHMENT ===\n');
  
  let needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const contact = row[2] || '';
    const title = row[3] || '';
    const email = row[4] || '';
    const website = row[5] || row[1] || ''; // Try column B if F is empty
    const status = row[9] || '';
    
    // Skip if marked as Dead or already has good contact
    if (status && (status.includes('Dead') || status.includes('Not PE'))) {
      continue;
    }
    
    // Check if needs enrichment
    const needsContact = !contact || contact.trim() === '';
    const needsEmail = !email || 
                      email.trim() === '' || 
                      email.startsWith('info@') || 
                      email.startsWith('sales@') || 
                      email.startsWith('ir@') ||
                      email.startsWith('contact@');
    
    if (needsContact || needsEmail) {
      needsEnrichment.push({
        row: i + 1,
        company,
        contact,
        title,
        email,
        website,
        status,
        needsContact,
        needsEmail
      });
    }
  }
  
  console.log(`Found ${needsEnrichment.length} leads needing enrichment\n`);
  
  // Show first 15
  needsEnrichment.slice(0, 15).forEach(lead => {
    console.log(`Row ${lead.row}: ${lead.company || '(No Company)'}`);
    console.log(`  Contact: ${lead.contact || 'EMPTY'}`);
    console.log(`  Title: ${lead.title || 'N/A'}`);
    console.log(`  Email: ${lead.email || 'EMPTY'}`);
    console.log(`  Website: ${lead.website || 'N/A'}`);
    console.log(`  Status: ${lead.status || 'N/A'}`);
    console.log(`  Needs: ${lead.needsContact ? 'Contact' : ''}${lead.needsContact && lead.needsEmail ? ' + ' : ''}${lead.needsEmail ? 'Email' : ''}`);
    console.log('');
  });
  
  // Save to JSON for Apollo script
  const fs = require('fs');
  fs.writeFileSync('enrichment-queue.json', JSON.stringify(needsEnrichment, null, 2));
  console.log(`\nSaved ${needsEnrichment.length} leads to enrichment-queue.json`);
}

findEnrichmentNeeds().catch(console.error);
