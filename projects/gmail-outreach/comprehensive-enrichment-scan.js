const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = './service-account.json';

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A2:L',
  });

  const rows = response.data.values;
  
  console.log('\n📊 ENRICHMENT STATUS REPORT');
  console.log('═'.repeat(80));
  console.log(`\nTotal rows: ${rows.length}\n`);
  
  const issues = {
    misaligned: [],
    emptyContact: [],
    genericEmail: [],
    noEmail: [],
    genericTitle: [],
    clean: 0
  };
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const company = (row[0] || '').trim();
    const contact = (row[2] || '').trim();
    const title = (row[3] || '').trim();
    const email = (row[4] || '').trim();
    const status = (row[7] || '').trim();
    
    if (!company) continue;
    
    // Skip sent/dead
    if (status && (status.toLowerCase().includes('sent') || status.toLowerCase().includes('dead'))) {
      continue;
    }
    
    // Check for misalignment
    const emailLooksLikeName = email && !email.includes('@');
    const contactIsTitle = contact && (
      contact.toLowerCase().includes('managing partner') ||
      contact.toLowerCase().includes('ceo') ||
      contact.toLowerCase().includes('president') ||
      contact.toLowerCase().includes('founder')
    );
    
    if (emailLooksLikeName || (!contact && !title && email)) {
      issues.misaligned.push({
        rowIndex: i + 2,
        company,
        contact,
        title,
        email,
        reason: 'Data misalignment - columns shifted'
      });
      continue;
    }
    
    // Check for empty/generic
    if (!contact) {
      issues.emptyContact.push({ rowIndex: i + 2, company, contact, title, email });
    } else if (!email) {
      issues.noEmail.push({ rowIndex: i + 2, company, contact, title, email });
    } else if (email.match(/^(info|sales|ir|contact|hello|support)@/i)) {
      issues.genericEmail.push({ rowIndex: i + 2, company, contact, title, email });
    } else if (contactIsTitle) {
      issues.genericTitle.push({ rowIndex: i + 2, company, contact, title, email });
    } else {
      issues.clean++;
    }
  }
  
  // Summary
  console.log('SUMMARY:');
  console.log('─'.repeat(80));
  console.log(`✅ Clean & ready: ${issues.clean}`);
  console.log(`⚠️  Data misalignment: ${issues.misaligned.length}`);
  console.log(`❌ Empty contact: ${issues.emptyContact.length}`);
  console.log(`❌ No email: ${issues.noEmail.length}`);
  console.log(`❌ Generic email: ${issues.genericEmail.length}`);
  console.log(`⚠️  Generic title (not person name): ${issues.genericTitle.length}`);
  
  // Detail top 15 that need work
  const allIssues = [
    ...issues.misaligned,
    ...issues.emptyContact,
    ...issues.noEmail,
    ...issues.genericEmail,
    ...issues.genericTitle
  ].slice(0, 15);
  
  console.log(`\n\n📋 TOP 15 FOR ENRICHMENT:\n`);
  console.log('─'.repeat(80));
  
  allIssues.forEach((item, idx) => {
    console.log(`\n${idx + 1}. ${item.company} (Row ${item.rowIndex})`);
    console.log(`   Contact: ${item.contact || '[EMPTY]'}`);
    console.log(`   Title: ${item.title || '[EMPTY]'}`);
    console.log(`   Email: ${item.email || '[EMPTY]'}`);
    if (item.reason) console.log(`   ⚠️  ${item.reason}`);
  });
  
  // Save for processing
  fs.writeFileSync(
    'enrichment-batch-current.json',
    JSON.stringify(allIssues, null, 2)
  );
  
  console.log(`\n\n💾 Saved ${allIssues.length} items to enrichment-batch-current.json`);
  
  // Save full report
  fs.writeFileSync(
    'enrichment-report-current.json',
    JSON.stringify(issues, null, 2)
  );
  
  console.log(`💾 Full report saved to enrichment-report-current.json\n`);
}

main().catch(console.error);
