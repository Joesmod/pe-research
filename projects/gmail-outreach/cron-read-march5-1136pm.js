const {google} = require('googleapis');
const fs = require('fs');

async function readSheet() {
  const key = JSON.parse(fs.readFileSync('./service-account.json', 'utf8'));
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({version: 'v4', auth: await auth.getClient()});
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A:J'
  });
  
  const rows = res.data.values || [];
  if (rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  const headers = rows[0];
  console.log('Headers:', headers);
  console.log('Total rows:', rows.length);
  
  // Find rows needing enrichment
  const needsEnrich = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const position = row[1] || '';
    const contactName = row[2] || '';
    const email = row[3] || '';
    const linkedin = row[4] || '';
    const status = row[5] || '';
    
    // Skip if already Dead or no company
    if (!company || status === 'Dead') continue;
    
    // Check if needs enrichment
    const hasGenericEmail = email.toLowerCase().match(/^(info@|sales@|ir@|contact@|hello@)/);
    const needsContact = !contactName || contactName.trim() === '';
    const needsEmail = !email || email.trim() === '' || hasGenericEmail;
    
    if (needsContact || needsEmail) {
      needsEnrich.push({
        row: i + 1,
        company,
        position,
        contactName,
        email,
        linkedin,
        status,
        needsContact,
        needsEmail
      });
    }
  }
  
  console.log('\n=== ENRICHMENT NEEDS ===');
  console.log(`Total needing enrichment: ${needsEnrich.length}`);
  
  fs.writeFileSync('./enrichment-needs-1136pm.json', JSON.stringify(needsEnrich, null, 2));
  console.log('\nSaved to enrichment-needs-1136pm.json');
  
  // Show first 15
  console.log('\n=== First 15 targets ===');
  needsEnrich.slice(0, 15).forEach((target, idx) => {
    console.log(`\n${idx + 1}. ${target.company} (Row ${target.row})`);
    console.log(`   Position: ${target.position || 'N/A'}`);
    console.log(`   Contact: ${target.contactName || 'MISSING'}`);
    console.log(`   Email: ${target.email || 'MISSING'}`);
    console.log(`   Status: ${target.status || 'N/A'}`);
  });
}

readSheet().catch(console.error);
