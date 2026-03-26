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
    range: 'Sheet1!A1:I',
  });
  
  const rows = response.data.values || [];
  console.log(`Total rows: ${rows.length}\n`);
  
  let emptyContactName = [];
  let emptyEmail = [];
  let genericEmail = [];
  let hasContactButNoEmail = [];
  let fullyEnriched = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] || [];
    const company = (row[0] || '').trim();
    const website = (row[1] || '').trim();
    const contactName = (row[2] || '').trim();
    const title = (row[3] || '').trim();
    const email = (row[4] || '').trim();
    const status = (row[7] || '').trim();
    
    if (!company || status.toLowerCase().includes('dead') || status.toLowerCase().includes('not pe')) {
      continue;
    }
    
    const hasGenericEmail = email && (
      email.toLowerCase().startsWith('info@') || 
      email.toLowerCase().startsWith('sales@') || 
      email.toLowerCase().startsWith('ir@') ||
      email.toLowerCase().startsWith('contact@') ||
      email.toLowerCase().startsWith('investors@')
    );
    
    const rowData = {
      row: i + 1,
      company,
      website,
      contactName,
      title,
      email,
      status
    };
    
    if (!contactName && !email) {
      emptyContactName.push(rowData);
    } else if (!contactName && email) {
      emptyContactName.push(rowData);
    } else if (contactName && !email) {
      hasContactButNoEmail.push(rowData);
    } else if (contactName && hasGenericEmail) {
      genericEmail.push(rowData);
    } else if (contactName && email && !hasGenericEmail) {
      fullyEnriched.push(rowData);
    }
  }
  
  console.log('='.repeat(80));
  console.log('ENRICHMENT NEEDS ANALYSIS - March 25, 2026 9:16 PM CST\n');
  
  console.log(`1. Empty Contact Name (no person identified): ${emptyContactName.length} firms`);
  if (emptyContactName.length > 0) {
    console.log('\nSample (first 10):');
    emptyContactName.slice(0, 10).forEach(r => {
      console.log(`   Row ${r.row}: ${r.company}`);
      console.log(`   Website: ${r.website}`);
      console.log(`   Current: [NO CONTACT] | ${r.email || '[NO EMAIL]'}`);
      console.log('');
    });
  }
  
  console.log(`\n2. Has Contact Name but NO Email: ${hasContactButNoEmail.length} firms`);
  if (hasContactButNoEmail.length > 0) {
    console.log('\nSample (first 10):');
    hasContactButNoEmail.slice(0, 10).forEach(r => {
      console.log(`   Row ${r.row}: ${r.company}`);
      console.log(`   Contact: ${r.contactName} (${r.title || 'no title'})`);
      console.log(`   Email: [MISSING]`);
      console.log('');
    });
  }
  
  console.log(`\n3. Has Contact + Generic Email: ${genericEmail.length} firms`);
  if (genericEmail.length > 0) {
    console.log('\nSample (first 10):');
    genericEmail.slice(0, 10).forEach(r => {
      console.log(`   Row ${r.row}: ${r.company}`);
      console.log(`   Contact: ${r.contactName} (${r.title || 'no title'})`);
      console.log(`   Generic email: ${r.email}`);
      console.log('');
    });
  }
  
  console.log(`\n4. Fully Enriched (contact + direct email): ${fullyEnriched.length} firms\n`);
  
  console.log('='.repeat(80));
  console.log('\nRECOMMENDATION:');
  console.log(`\nPriority 1: Enrich ${emptyContactName.length} firms with NO Contact Name`);
  console.log(`  - These need Apollo/web research to find ANY decision-maker`);
  console.log(`\nPriority 2: Find emails for ${hasContactButNoEmail.length} firms with Contact but no Email`);
  console.log(`  - Named contacts exist, just need their direct emails`);
  console.log(`\nPriority 3: Replace ${genericEmail.length} generic emails with direct contacts`);
  console.log(`  - Lower priority - at least we have a way to reach them\n`);
}

main().catch(console.error);
