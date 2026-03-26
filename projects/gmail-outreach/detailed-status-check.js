const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

async function detailedCheck() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:I',
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }

  const headers = rows[0];
  
  let totalFirms = 0;
  let enriched = 0;
  let needsWork = 0;
  let dead = 0;
  let genericEmails = 0;
  let noContact = 0;
  let noEmail = 0;
  
  const issues = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    
    if (!company || company.trim() === '') continue;
    
    totalFirms++;
    
    const contact = row[2] || '';
    const email = row[4] || '';
    const status = row[7] || '';
    
    if (status === 'Dead' || status === 'Not PE') {
      dead++;
      continue;
    }
    
    const hasGenericEmail = email && email.match(/^(info|sales|ir|contact|hello|support|admin|general)@/i);
    const hasNoContact = !contact || contact.trim() === '';
    const hasNoEmail = !email || email.trim() === '';
    
    if (hasGenericEmail) {
      genericEmails++;
      issues.push({
        row: i + 1,
        company,
        contact,
        email,
        status,
        issue: 'Generic email'
      });
    }
    
    if (hasNoContact) {
      noContact++;
      issues.push({
        row: i + 1,
        company,
        contact: 'EMPTY',
        email,
        status,
        issue: 'No contact'
      });
    }
    
    if (hasNoEmail) {
      noEmail++;
      if (!hasNoContact) {  // Only add if not already added
        issues.push({
          row: i + 1,
          company,
          contact,
          email: 'EMPTY',
          status,
          issue: 'No email'
        });
      }
    }
    
    if (status === 'Enriched' && !hasGenericEmail && !hasNoContact && !hasNoEmail) {
      enriched++;
    } else if (!hasGenericEmail && !hasNoContact && !hasNoEmail) {
      needsWork++;
    }
  }
  
  console.log(`\n=== SHEET STATUS ===`);
  console.log(`Total firms: ${totalFirms}`);
  console.log(`Fully enriched: ${enriched}`);
  console.log(`Dead/Not PE: ${dead}`);
  console.log(`Firms needing work: ${issues.length}`);
  console.log(`  - Generic emails: ${genericEmails}`);
  console.log(`  - No contact: ${noContact}`);
  console.log(`  - No email: ${noEmail}`);
  
  console.log(`\n=== TOP 15 ISSUES ===`);
  issues.slice(0, 15).forEach(item => {
    console.log(`\nRow ${item.row}: ${item.company}`);
    console.log(`  Contact: ${item.contact}`);
    console.log(`  Email: ${item.email}`);
    console.log(`  Status: ${item.status}`);
    console.log(`  Issue: ${item.issue}`);
  });
  
  if (issues.length > 0) {
    const fs = require('fs');
    fs.writeFileSync('needs-enrichment-full.json', JSON.stringify(issues, null, 2));
    console.log(`\n✅ Saved ${issues.length} firms to needs-enrichment-full.json`);
  }
}

detailedCheck().catch(console.error);
