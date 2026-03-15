const { google } = require('googleapis');

async function findRemaining() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A1:N1021'
  });
  
  const rows = res.data.values || [];
  const needsWork = [];
  
  for (let i = 1; i < rows.length; i++) {
    const [company, , contact, title, email, , linkedin, , , , status] = rows[i];
    
    const genericContact = !contact || 
      contact.toLowerCase().includes('investor relations') ||
      contact.toLowerCase().includes('general') ||
      contact.toLowerCase().includes('contact');
    
    const genericEmail = !email || 
      email.includes('info@') ||
      email.includes('ir@') ||
      email.includes('sales@') ||
      email.includes('contact@') ||
      email.includes('general@');
    
    const needsResearch = status && (
      status.includes('Needs Manual Research') ||
      status.includes('Generic Contact')
    );
    
    if ((genericContact || genericEmail) && needsResearch) {
      needsWork.push({
        row: i + 1,
        company,
        contact: contact || 'EMPTY',
        email: email || 'EMPTY',
        status
      });
    }
  }
  
  console.log('🔍 Remaining firms needing enrichment:\n');
  needsWork.slice(0, 15).forEach((firm, idx) => {
    console.log(`${idx + 1}. Row ${firm.row}: ${firm.company}`);
    console.log(`   Contact: ${firm.contact}`);
    console.log(`   Email: ${firm.email}`);
    console.log(`   Status: ${firm.status}`);
    console.log('');
  });
  
  console.log(`📊 Total remaining: ${needsWork.length}`);
}

findRemaining().catch(console.error);
