const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

async function main() {
  const sheets = google.sheets({ version: 'v4', auth });
  
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:L'
  });
  
  const rows = res.data.values || [];
  
  console.log('Firms needing enrichment (empty contact or generic email):\n');
  
  const gaps = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const contact = row[2] || '';
    const email = row[4] || '';
    const status = row[7] || '';
    
    // Skip if company name is empty
    if (!company) continue;
    
    // Check if needs enrichment
    const needsContact = !contact || contact.trim() === '';
    const hasGenericEmail = email.includes('info@') || 
                           email.includes('contact@') || 
                           email.includes('ir@') || 
                           email.includes('sales@');
    const needsEmail = !email || email.trim() === '' || hasGenericEmail;
    
    if (needsContact || needsEmail) {
      gaps.push({
        row: i + 1,
        company,
        contact,
        email,
        status,
        needsContact,
        needsEmail
      });
    }
  }
  
  // Show first 30
  for (let i = 0; i < Math.min(30, gaps.length); i++) {
    const gap = gaps[i];
    console.log(`${i + 1}. ${gap.company} (Row ${gap.row})`);
    console.log(`   Contact: '${gap.contact}' ${gap.needsContact ? '❌ MISSING' : '✓'}`);
    console.log(`   Email: '${gap.email}' ${gap.needsEmail ? '❌ NEEDS WORK' : '✓'}`);
    console.log(`   Status: '${gap.status}'`);
    console.log('');
  }
  
  console.log(`\nTotal gaps found: ${gaps.length}`);
  console.log(`\nTop priority targets (no contact at all):`);
  
  const noContact = gaps.filter(g => g.needsContact).slice(0, 15);
  noContact.forEach((gap, idx) => {
    console.log(`${idx + 1}. ${gap.company}`);
  });
}

main().catch(console.error);
