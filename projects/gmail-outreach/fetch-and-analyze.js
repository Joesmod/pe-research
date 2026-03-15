const { google } = require('googleapis');
const fs = require('fs');

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

(async () => {
  try {
    const sheets = google.sheets({ version: 'v4', auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
      range: 'Sheet1!A:K'
    });
    
    const rows = res.data.values || [];
    console.log(`Fetched ${rows.length} rows from sheet`);
    
    // Save raw data
    fs.writeFileSync('sheet-data.json', JSON.stringify(rows, null, 2));
    
    // Analyze for enrichment needs
    const genericEmails = ['info@', 'sales@', 'ir@', 'contact@', 'investor@', 'admin@'];
    const needsEnrichment = [];
    
    for (let i = 1; i < rows.length; i++) {  // Skip header row
      const row = rows[i];
      if (!row || row.length < 5) continue;
      
      const [date, firmName, title, contactName, email, linkedin, status, notes] = row;
      
      // Skip if already enriched or dead
      if (status && (status.toLowerCase().includes('enriched') || status.toLowerCase().includes('dead'))) {
        continue;
      }
      
      // Check if needs enrichment
      const needsContact = !contactName || contactName.trim() === '';
      let needsEmail = !email || email.trim() === '';
      
      // Check for generic emails
      if (!needsEmail) {
        for (const generic of genericEmails) {
          if (email.toLowerCase().startsWith(generic)) {
            needsEmail = true;
            break;
          }
        }
      }
      
      if (needsContact || needsEmail) {
        needsEnrichment.push({
          rowIndex: i + 1,  // Sheet row number (1-indexed + header)
          firmName,
          currentTitle: title || '',
          currentContact: contactName || '',
          currentEmail: email || '',
          needsContact,
          needsEmail,
          status: status || 'Active'
        });
      }
    }
    
    console.log(`\nFound ${needsEnrichment.length} firms needing enrichment\n`);
    console.log('First 15 firms to enrich:\n');
    
    for (let i = 0; i < Math.min(15, needsEnrichment.length); i++) {
      const firm = needsEnrichment[i];
      console.log(`[Row ${firm.rowIndex}] ${firm.firmName}`);
      if (firm.needsContact) console.log(`  - Missing contact name`);
      if (firm.needsEmail) console.log(`  - ${firm.currentEmail ? 'Generic' : 'Missing'} email: ${firm.currentEmail}`);
      console.log('');
    }
    
    // Save enrichment targets
    fs.writeFileSync('needs-enrichment.json', JSON.stringify(needsEnrichment, null, 2));
    console.log(`\nSaved ${needsEnrichment.length} enrichment targets to needs-enrichment.json`);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
