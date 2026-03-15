const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const credentials = JSON.parse(fs.readFileSync('service-account.json', 'utf8'));

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

async function listActiveNeedsEnrichment() {
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:J'
  });
  
  const rows = response.data.values;
  const header = rows[0];
  
  console.log('Finding active leads that need enrichment...\n');
  
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1;
    
    const company = row[0] || '';
    const aum = row[1] || '';
    const contactName = row[2] || '';
    const title = row[3] || '';
    const email = row[4] || '';
    const website = row[5] || '';
    const linkedin = row[6] || '';
    const sectors = row[7] || '';
    const notes = row[8] || '';
    const status = row[9] || '';
    
    // Skip Dead leads
    if (status && status.toLowerCase().includes('dead')) {
      continue;
    }
    
    // Check if needs enrichment
    const hasNoContact = !contactName || contactName.trim() === '';
    const hasGenericEmail = email && (
      email.includes('info@') || 
      email.includes('sales@') || 
      email.includes('ir@') ||
      email.includes('contact@') ||
      email.includes('general@')
    );
    const hasNoEmail = !email || email.trim() === '';
    
    if (hasNoContact || hasGenericEmail || hasNoEmail) {
      needsEnrichment.push({
        row: rowNum,
        company,
        aum,
        contactName,
        title,
        email,
        website,
        linkedin,
        sectors,
        notes,
        status,
        reason: hasNoContact ? 'No contact' : hasGenericEmail ? 'Generic email' : 'No email'
      });
    }
  }
  
  // Show first 20
  console.log(`Found ${needsEnrichment.length} active leads needing enrichment\n`);
  console.log('='* 80);
  
  needsEnrichment.slice(0, 20).forEach((item, idx) => {
    console.log(`\n${idx + 1}. Row ${item.row}: ${item.company}`);
    console.log(`   AUM: ${item.aum}`);
    console.log(`   Contact: ${item.contactName || '(empty)'}`);
    console.log(`   Title: ${item.title || '(empty)'}`);
    console.log(`   Email: ${item.email || '(empty)'}`);
    console.log(`   Website: ${item.website || '(empty)'}`);
    console.log(`   LinkedIn: ${item.linkedin || '(empty)'}`);
    console.log(`   Sectors: ${item.sectors || '(empty)'}`);
    console.log(`   Status: ${item.status || '(empty)'}`);
    console.log(`   Reason: ${item.reason}`);
    console.log(`   Notes: ${item.notes || '(empty)'}`);
  });
  
  console.log('\n' + '='.repeat(80));
  console.log(`\nShowing first 20 of ${needsEnrichment.length} total`);
  
  // Write to JSON for easy parsing
  fs.writeFileSync('needs-enrichment.json', JSON.stringify(needsEnrichment, null, 2));
  console.log('\nFull list saved to needs-enrichment.json');
}

listActiveNeedsEnrichment().catch(console.error);
