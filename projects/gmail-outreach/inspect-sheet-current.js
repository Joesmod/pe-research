const { google } = require('googleapis');

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A1:I100',
  });
  
  const rows = response.data.values || [];
  
  console.log('📊 PE Lead Sheet Inspection\n');
  console.log(`Total rows: ${rows.length}\n`);
  console.log('Headers:', rows[0]);
  console.log('\n' + '='.repeat(80) + '\n');
  
  let emptyContact = 0;
  let genericEmail = 0;
  let enriched = 0;
  let dead = 0;
  
  for (let i = 1; i < Math.min(rows.length, 50); i++) {
    const row = rows[i] || [];
    const company = (row[0] || '').trim();
    const website = (row[1] || '').trim();
    const contactName = (row[2] || '').trim();
    const title = (row[3] || '').trim();
    const email = (row[4] || '').trim();
    const linkedin = (row[6] || '').trim();
    const status = (row[7] || '').trim();
    const notes = (row[8] || '').trim();
    
    // Count status
    if (status.toLowerCase().includes('enriched')) enriched++;
    if (status.toLowerCase().includes('dead')) dead++;
    
    // Check if needs enrichment
    const noContact = !contactName;
    const noEmail = !email;
    const hasGenericEmail = email.startsWith('info@') || email.startsWith('sales@') || email.startsWith('ir@') || email.startsWith('contact@');
    
    if (noContact) emptyContact++;
    if (hasGenericEmail) genericEmail++;
    
    const needsEnrich = (noContact || noEmail || hasGenericEmail) && !status.toLowerCase().includes('enriched') && !status.toLowerCase().includes('dead') && company;
    
    if (needsEnrich || i < 20) {
      console.log(`Row ${i + 1}: ${company}`);
      console.log(`  Website: ${website}`);
      console.log(`  Contact: ${contactName || '[EMPTY]'}`);
      console.log(`  Title: ${title}`);
      console.log(`  Email: ${email || '[EMPTY]'}`);
      console.log(`  Status: ${status || '[EMPTY]'}`);
      if (needsEnrich) console.log(`  🎯 NEEDS ENRICHMENT`);
      console.log('');
    }
  }
  
  console.log('='.repeat(80));
  console.log('\n📈 Summary:');
  console.log(`  Total rows: ${rows.length - 1}`);
  console.log(`  Enriched: ${enriched}`);
  console.log(`  Dead/Not PE: ${dead}`);
  console.log(`  Empty contact names: ${emptyContact}`);
  console.log(`  Generic emails: ${genericEmail}`);
}

main().catch(console.error);
