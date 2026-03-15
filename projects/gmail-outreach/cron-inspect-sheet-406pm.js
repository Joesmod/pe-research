const { google } = require('googleapis');

async function inspectSheet() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
    
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A:K',
    });
    
    const rows = result.data.values;
    const headers = rows[0];
    
    console.log('Total rows:', rows.length);
    console.log('\nFirst 10 data rows:\n');
    
    for (let i = 1; i <= Math.min(10, rows.length - 1); i++) {
      const row = rows[i];
      console.log(`Row ${i + 1}:`);
      console.log(`  Company: ${row[0] || '(empty)'}`);
      console.log(`  Contact: ${row[2] || '(empty)'}`);
      console.log(`  Email: ${row[4] || '(empty)'}`);
      console.log(`  Status: ${row[9] || '(empty)'}`);
      console.log('');
    }
    
    // Count stats
    let emptyContact = 0;
    let genericEmail = 0;
    let enriched = 0;
    let deadLead = 0;
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;
      
      const contact = row[2] || '';
      const email = row[4] || '';
      const status = row[9] || '';
      
      if (status.toLowerCase().includes('dead')) deadLead++;
      if (status.toLowerCase() === 'enriched') enriched++;
      if (!contact || contact.trim() === '') emptyContact++;
      if (email && (email.includes('info@') || email.includes('sales@') || email.includes('ir@') || email.includes('contact@'))) {
        genericEmail++;
      }
    }
    
    console.log('\nStats:');
    console.log(`  Empty contact: ${emptyContact}`);
    console.log(`  Generic email: ${genericEmail}`);
    console.log(`  Enriched: ${enriched}`);
    console.log(`  Dead leads: ${deadLead}`);
    console.log(`  Total rows: ${rows.length - 1}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

inspectSheet();
