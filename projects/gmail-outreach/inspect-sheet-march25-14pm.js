const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:I50',  // First 50 rows
  });
  
  const rows = response.data.values || [];
  
  console.log('Sheet Structure:\n');
  console.log('Headers:', rows[0]);
  console.log(`\nTotal rows: ${rows.length - 1}\n`);
  
  // Sample first 10 data rows
  console.log('Sample data rows:\n');
  for (let i = 1; i <= Math.min(10, rows.length - 1); i++) {
    const row = rows[i] || [];
    console.log(`Row ${i + 1}:`);
    console.log(`  Company: ${row[0] || '[EMPTY]'}`);
    console.log(`  Website: ${row[1] || '[EMPTY]'}`);
    console.log(`  Contact Name: ${row[2] || '[EMPTY]'}`);
    console.log(`  Title: ${row[3] || '[EMPTY]'}`);
    console.log(`  Email: ${row[4] || '[EMPTY]'}`);
    console.log(`  Status: ${row[7] || '[EMPTY]'}`);
    console.log(`  Notes: ${row[8] || '[EMPTY]'}`);
    console.log('');
  }
  
  // Count needs enrichment
  let needsEnrichment = 0;
  let hasGenericEmail = 0;
  let noContact = 0;
  let noEmail = 0;
  let alreadyEnriched = 0;
  let dead = 0;
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] || [];
    const company = (row[0] || '').trim();
    const contactName = (row[2] || '').trim();
    const email = (row[4] || '').trim();
    const status = (row[7] || '').trim().toLowerCase();
    
    if (!company) continue;
    
    if (status.includes('dead') || status.includes('not pe')) {
      dead++;
      continue;
    }
    
    if (status.includes('enriched')) {
      alreadyEnriched++;
      continue;
    }
    
    if (!contactName) noContact++;
    if (!email) noEmail++;
    
    const isGeneric = email && (
      email.toLowerCase().startsWith('info@') || 
      email.toLowerCase().startsWith('sales@') || 
      email.toLowerCase().startsWith('ir@') ||
      email.toLowerCase().startsWith('contact@') ||
      email.toLowerCase().startsWith('investors@')
    );
    
    if (isGeneric) hasGenericEmail++;
    
    if ((!contactName || !email || isGeneric) && !status.includes('enriched')) {
      needsEnrichment++;
    }
  }
  
  console.log('\n=== STATISTICS ===');
  console.log(`Total firms: ${rows.length - 1}`);
  console.log(`Dead/Not PE: ${dead}`);
  console.log(`Already enriched: ${alreadyEnriched}`);
  console.log(`No contact name: ${noContact}`);
  console.log(`No email: ${noEmail}`);
  console.log(`Generic email: ${hasGenericEmail}`);
  console.log(`\n>>> NEEDS ENRICHMENT: ${needsEnrichment} <<<\n`);
}

main().catch(console.error);
