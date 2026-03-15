const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');

const COLS = {
  COMPANY: 0,
  WEBSITE: 1,
  CONTACT: 2,
  TITLE: 3,
  EMAIL: 4,
  ALT: 5,
  LINKEDIN: 6,
  STATUS: 7,
  NOTES1: 8,
  STATUS2: 9
};

async function run() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_FILE,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:O'
    });
    
    const rows = response.data.values || [];
    
    console.log(`\n📊 Total rows in sheet: ${rows.length}\n`);
    
    let enriched = 0;
    let needsWork = 0;
    let dead = 0;
    let empty = 0;
    let genericEmails = 0;
    let noContact = 0;
    
    const examples = {
      needsWork: [],
      genericEmail: [],
      noContact: []
    };
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) {
        empty++;
        continue;
      }
      
      const company = (row[COLS.COMPANY] || '').trim();
      const contact = (row[COLS.CONTACT] || '').trim();
      const email = (row[COLS.EMAIL] || '').trim();
      const status = (row[COLS.STATUS] || '').toLowerCase();
      const status2 = (row[COLS.STATUS2] || '').toLowerCase();
      
      if (!company || company === 'Company Name') continue;
      
      if (status.includes('dead') || status2.includes('dead')) {
        dead++;
        continue;
      }
      
      if (status.includes('enriched') || status2.includes('enriched')) {
        enriched++;
        continue;
      }
      
      // Check for issues
      const hasGenericEmail = email.includes('info@') || 
                              email.includes('sales@') || 
                              email.includes('ir@') || 
                              email.includes('contact@') ||
                              email.includes('investor@');
      
      const missingContact = !contact || contact.length < 3;
      const missingEmail = !email;
      
      if (missingContact || missingEmail || hasGenericEmail) {
        needsWork++;
        if (needsWork <= 20) {
          const issue = [];
          if (missingContact) { 
            issue.push('NO_CONTACT'); 
            noContact++;
            if (examples.noContact.length < 5) examples.noContact.push(`Row ${i+1}: ${company}`);
          }
          if (missingEmail || hasGenericEmail) { 
            issue.push(hasGenericEmail ? 'GENERIC_EMAIL' : 'NO_EMAIL'); 
            genericEmails++;
            if (examples.genericEmail.length < 5) examples.genericEmail.push(`Row ${i+1}: ${company} | ${email || 'empty'}`);
          }
          console.log(`Row ${i+1}: ${company} | ${issue.join(', ')} | ${contact || 'empty'} | ${email || 'empty'}`);
        }
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   Total rows: ${rows.length - 1} (excluding header)`);
    console.log(`   Enriched: ${enriched}`);
    console.log(`   Dead: ${dead}`);
    console.log(`   Empty rows: ${empty}`);
    console.log(`   ⚠️  Needs enrichment: ${needsWork}`);
    console.log(`      - Missing contact: ${noContact}`);
    console.log(`      - Generic/missing email: ${genericEmails}`);
    
    if (examples.noContact.length > 0) {
      console.log(`\n📋 Examples - No Contact:`);
      examples.noContact.forEach(ex => console.log(`   ${ex}`));
    }
    
    if (examples.genericEmail.length > 0) {
      console.log(`\n📋 Examples - Generic/No Email:`);
      examples.genericEmail.forEach(ex => console.log(`   ${ex}`));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

run();
