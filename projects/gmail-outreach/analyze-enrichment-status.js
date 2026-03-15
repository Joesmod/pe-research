const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

async function analyze() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:P',
  });
  
  const rows = res.data.values || [];
  let needsWork = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const contact = row[2] || '';
    const email = row[4] || '';
    const status = row[9] || '';
    
    const skip = status.toLowerCase().includes('dead') || 
                 status.toLowerCase().includes('not a pe') ||
                 status.toLowerCase().includes('remove');
    
    if (skip || !company) continue;
    
    const hasNoContact = !contact || contact.trim() === '';
    const hasNoEmail = !email || email.trim() === '';
    const hasGenericEmail = email && /^(info|sales|ir|contact|team|admin|support|hello|general)@/i.test(email);
    
    if (hasNoContact || hasNoEmail || hasGenericEmail) {
      needsWork.push({
        row: i + 1,
        company,
        contact: contact || '(none)',
        email: email || '(none)',
        status: status || '(none)'
      });
    }
  }
  
  console.log('=== ENRICHMENT STATUS ===');
  console.log(`Total rows: ${rows.length}`);
  console.log(`Needs enrichment: ${needsWork.length}\n`);
  
  if (needsWork.length > 0) {
    console.log('Leads needing enrichment (showing first 20):');
    needsWork.slice(0, 20).forEach(lead => {
      console.log(`  Row ${lead.row}: ${lead.company}`);
      console.log(`    Contact: ${lead.contact} | Email: ${lead.email}`);
      console.log(`    Status: ${lead.status}\n`);
    });
  } else {
    console.log('✓ All leads have contacts and emails!');
  }
}

analyze().catch(console.error);
