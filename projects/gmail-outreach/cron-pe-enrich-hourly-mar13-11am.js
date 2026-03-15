const { google } = require('googleapis');
const sheets = google.sheets('v4');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = './service-account.json';

async function authenticate() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return auth.getClient();
}

async function readSheet() {
  const auth = await authenticate();
  
  const response = await sheets.spreadsheets.values.get({
    auth,
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:M',
  });

  return response.data.values || [];
}

async function main() {
  console.log('📊 Reading PE firms sheet...\n');
  
  const data = await readSheet();
  const headers = data[0];
  const rows = data.slice(1);
  
  console.log('Headers:', headers.join(' | '));
  console.log('Total rows:', rows.length);
  console.log('\n' + '='.repeat(120));
  console.log('Leads needing enrichment (empty Contact Name or generic Email):');
  console.log('='.repeat(120) + '\n');
  
  const needsEnrichment = [];
  
  rows.forEach((row, idx) => {
    const company = row[0] || '';
    const contactName = row[2] || '';
    const title = row[3] || '';
    const email = row[4] || '';
    const website = row[5] || '';
    const linkedin = row[6] || '';
    const status = row[9] || '';
    
    const rowNum = idx + 2; // +2 because idx starts at 0 and we skipped header row
    
    // Check if needs enrichment
    const hasGenericEmail = email && (email.toLowerCase().includes('info@') || 
                                       email.toLowerCase().includes('sales@') || 
                                       email.toLowerCase().includes('ir@') ||
                                       email.toLowerCase().includes('contact@') ||
                                       email.toLowerCase().includes('invest@'));
    
    const needsWork = !contactName || hasGenericEmail || !email;
    
    if (needsWork && status !== 'Dead' && company) {
      needsEnrichment.push({
        rowNum,
        company,
        contactName,
        title,
        email,
        website,
        linkedin,
        status
      });
      
      console.log(`Row ${rowNum}: ${company}`);
      console.log(`  Contact: '${contactName}' | Title: '${title}' | Email: '${email}'`);
      console.log(`  Website: ${website}`);
      console.log(`  LinkedIn: ${linkedin}`);
      console.log(`  Status: ${status}`);
      console.log('');
    }
  });
  
  console.log('='.repeat(120));
  console.log(`\n✅ Found ${needsEnrichment.length} leads needing enrichment\n`);
  
  // Save to JSON for reference
  const fs = require('fs');
  fs.writeFileSync('enrichment-targets-march13-11am.json', JSON.stringify(needsEnrichment, null, 2));
  console.log('💾 Saved to enrichment-targets-march13-11am.json');
  
  return needsEnrichment;
}

main().catch(console.error);
