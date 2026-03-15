const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function run() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // Read the sheet
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:K'
    });
    
    const rows = res.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found.');
      return;
    }

    const headers = rows[0];
    console.log('Headers:', headers);
    
    // Find rows needing enrichment
    const needsEnrichment = [];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const company = row[0] || '';
      const contactName = row[2] || '';
      const email = row[3] || '';
      const status = row[6] || '';
      
      // Skip if already enriched, sent, replied, or dead
      if (status === 'Enriched' || status === 'Sent' || status === 'Replied' || status === 'Dead') {
        continue;
      }
      
      // Check if needs enrichment
      const hasGenericEmail = email && (email.includes('info@') || email.includes('sales@') || email.includes('ir@') || email.includes('contact@'));
      const noContact = !contactName || contactName.trim() === '';
      const noEmail = !email || email.trim() === '';
      
      if (noContact || noEmail || hasGenericEmail) {
        needsEnrichment.push({
          rowIndex: i + 1,
          company,
          contactName,
          email,
          status,
          issue: noContact ? 'No contact' : (noEmail ? 'No email' : 'Generic email')
        });
      }
    }
    
    console.log(`\nFound ${needsEnrichment.length} leads needing enrichment\n`);
    
    // Take first 15
    const targets = needsEnrichment.slice(0, 15);
    
    targets.forEach((t, idx) => {
      console.log(`${idx + 1}. Row ${t.rowIndex}: ${t.company}`);
      console.log(`   Contact: ${t.contactName || '(empty)'}`);
      console.log(`   Email: ${t.email || '(empty)'}`);
      console.log(`   Issue: ${t.issue}`);
      console.log(`   Status: ${t.status || '(empty)'}`);
      console.log('');
    });
    
    // Save targets to file
    fs.writeFileSync('enrich-targets-march9-536pm.json', JSON.stringify(targets, null, 2));
    console.log('Saved targets to enrich-targets-march9-536pm.json');
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

run();
