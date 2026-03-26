const { google } = require('googleapis');
const path = require('path');

async function checkSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'service-account.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A1:O100'
  });
  
  const rows = response.data.values || [];
  console.log('Headers:', rows[0]);
  console.log('\nSample rows (2-20):');
  
  for (let i = 1; i < Math.min(20, rows.length); i++) {
    const row = rows[i];
    console.log(`\nRow ${i+1}:`);
    console.log('  Company:', row[1]);
    console.log('  Contact:', row[2] || '(empty)');
    console.log('  Title:', row[3] || '(empty)');
    console.log('  Email:', row[4] || '(empty)');
    console.log('  Website:', row[10] || '(empty)');
    console.log('  Status:', row[14] || '(empty)');
  }
  
  // Count needs enrichment
  const headers = rows[0];
  const companyIdx = headers.indexOf('Company/Firm');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const statusIdx = headers.indexOf('Status');
  
  let needsCount = 0;
  let emptyContact = 0;
  let genericEmail = 0;
  let hasContact = 0;
  let deadFirms = 0;
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = (row[statusIdx] || '').toLowerCase();
    
    if (!company) continue;
    
    if (status.includes('dead') || status === 'closed') {
      deadFirms++;
      continue;
    }
    
    if (!contact) emptyContact++;
    if (contact) hasContact++;
    
    if (!email || email.toLowerCase().includes('info@') || email.toLowerCase().includes('sales@') || email.toLowerCase().includes('ir@') || email.toLowerCase().includes('contact@')) {
      genericEmail++;
    }
    
    const needsWork = !contact || !email || email.toLowerCase().includes('info@') || email.toLowerCase().includes('sales@') || email.toLowerCase().includes('ir@') || email.toLowerCase().includes('contact@');
    
    if (needsWork && company) needsCount++;
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('SHEET STATS:');
  console.log('='.repeat(60));
  console.log('Total rows:', rows.length);
  console.log('Dead firms:', deadFirms);
  console.log('Firms with contacts:', hasContact);
  console.log('Empty contact name:', emptyContact);
  console.log('Generic/empty emails:', genericEmail);
  console.log('NEEDS ENRICHMENT:', needsCount);
}

checkSheet().catch(console.error);
