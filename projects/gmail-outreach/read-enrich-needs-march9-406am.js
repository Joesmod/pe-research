const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function readSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:L',
    });
    
    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found.');
      return;
    }
    
    const headers = rows[0];
    console.log('Headers:', headers.join(' | '));
    console.log('\nTotal rows:', rows.length - 1);
    
    // Find firms needing enrichment
    const needsEnrichment = [];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const firm = row[0] || '';
      const contact = row[2] || '';
      const email = row[3] || '';
      const status = row[9] || '';
      
      // Skip if Status is Sent, Dead/Invalid, Enriched
      if (status === 'Sent' || status === 'Dead/Invalid' || status === 'Enriched') {
        continue;
      }
      
      // Check if needs enrichment
      const hasNoContact = !contact || contact.trim() === '';
      const hasGenericEmail = email && (
        email.toLowerCase().includes('info@') ||
        email.toLowerCase().includes('sales@') ||
        email.toLowerCase().includes('ir@') ||
        email.toLowerCase().includes('contact@') ||
        email.toLowerCase().includes('hello@')
      );
      const hasNoEmail = !email || email.trim() === '';
      
      if (hasNoContact || hasGenericEmail || hasNoEmail) {
        needsEnrichment.push({
          row: i + 1,
          firm: firm,
          contact: contact || '[EMPTY]',
          email: email || '[EMPTY]',
          status: status || '[EMPTY]',
          domain: row[1] || '',
          title: row[4] || '',
        });
      }
    }
    
    console.log('\n=== ENRICHMENT NEEDED ===');
    console.log('Total firms needing enrichment:', needsEnrichment.length);
    console.log('\nFirst 15:');
    needsEnrichment.slice(0, 15).forEach((item, idx) => {
      console.log(`\n${idx + 1}. Row ${item.row}: ${item.firm}`);
      console.log(`   Contact: ${item.contact}`);
      console.log(`   Email: ${item.email}`);
      console.log(`   Domain: ${item.domain}`);
      console.log(`   Status: ${item.status}`);
    });
    
    // Save full list
    fs.writeFileSync(
      'enrich-targets-march9-406am.json',
      JSON.stringify(needsEnrichment, null, 2)
    );
    
    console.log(`\n✓ Full list saved to enrich-targets-march9-406am.json`);
    
  } catch (error) {
    console.error('Error reading sheet:', error);
  }
}

readSheet();
