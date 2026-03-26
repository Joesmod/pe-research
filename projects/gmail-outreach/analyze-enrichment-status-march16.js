/**
 * Analyze enrichment status - what's actually in the sheet?
 */

const { google } = require('googleapis');
const path = require('path');

const CRM_SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

const GENERIC_PATTERNS = /^(info|contact|sales|ir|investor\.relations|hello|support|admin|general|inquiries)@/i;

async function analyze() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: CRM_SHEET_ID,
    range: 'Sheet1!A:N',
  });
  
  const rows = res.data.values || [];
  const dataRows = rows.slice(1); // Skip header
  
  console.log(`📊 Total data rows: ${dataRows.length}\n`);
  
  let noContact = 0;
  let noEmail = 0;
  let genericEmail = 0;
  let noWebsite = 0;
  let dead = 0;
  let sent = 0;
  let fullyEnriched = 0;
  
  const examples = {
    noContact: [],
    noEmail: [],
    genericEmail: [],
    noWebsite: [],
  };
  
  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i] || [];
    const rowNum = i + 2;
    
    const company = (row[0] || '').trim();
    const website1 = (row[1] || '').trim();
    const contact = (row[2] || '').trim();
    const email = (row[4] || '').trim();
    const website2 = (row[5] || '').trim();
    const status = (row[9] || '').trim().toLowerCase();
    
    if (!company) continue;
    
    if (status === 'dead') {
      dead++;
      continue;
    }
    
    if (status === 'sent') {
      sent++;
      continue;
    }
    
    const hasWebsite = (website1 && website1.startsWith('http')) || (website2 && website2.startsWith('http'));
    
    if (!hasWebsite) {
      noWebsite++;
      if (examples.noWebsite.length < 5) {
        examples.noWebsite.push({ rowNum, company, contact, email });
      }
      continue;
    }
    
    if (!contact) {
      noContact++;
      if (examples.noContact.length < 10) {
        examples.noContact.push({ rowNum, company, contact, email, website: website1 || website2 });
      }
    }
    
    if (!email) {
      noEmail++;
      if (examples.noEmail.length < 10) {
        examples.noEmail.push({ rowNum, company, contact, email, website: website1 || website2 });
      }
    } else if (GENERIC_PATTERNS.test(email)) {
      genericEmail++;
      if (examples.genericEmail.length < 10) {
        examples.genericEmail.push({ rowNum, company, contact, email, website: website1 || website2 });
      }
    }
    
    if (contact && email && !GENERIC_PATTERNS.test(email)) {
      fullyEnriched++;
    }
  }
  
  console.log('📈 Status Breakdown:');
  console.log(`  Dead: ${dead}`);
  console.log(`  Sent: ${sent}`);
  console.log(`  No website: ${noWebsite}`);
  console.log(`  Fully enriched (has contact + valid email): ${fullyEnriched}`);
  console.log('');
  
  console.log('❓ Enrichment Gaps:');
  console.log(`  Missing contact name: ${noContact}`);
  console.log(`  Missing email: ${noEmail}`);
  console.log(`  Generic email (info@, sales@, etc.): ${genericEmail}`);
  console.log('');
  
  if (examples.noContact.length > 0) {
    console.log('📋 Examples with NO CONTACT:');
    examples.noContact.forEach(ex => {
      console.log(`  Row ${ex.rowNum}: ${ex.company}`);
      console.log(`    Email: ${ex.email || '(empty)'}`);
      console.log(`    Website: ${ex.website}`);
    });
    console.log('');
  }
  
  if (examples.noEmail.length > 0) {
    console.log('📋 Examples with NO EMAIL:');
    examples.noEmail.forEach(ex => {
      console.log(`  Row ${ex.rowNum}: ${ex.company}`);
      console.log(`    Contact: ${ex.contact || '(empty)'}`);
      console.log(`    Website: ${ex.website}`);
    });
    console.log('');
  }
  
  if (examples.genericEmail.length > 0) {
    console.log('📋 Examples with GENERIC EMAIL:');
    examples.genericEmail.forEach(ex => {
      console.log(`  Row ${ex.rowNum}: ${ex.company}`);
      console.log(`    Contact: ${ex.contact || '(empty)'}`);
      console.log(`    Email: ${ex.email}`);
      console.log(`    Website: ${ex.website}`);
    });
    console.log('');
  }
  
  console.log(`\n✅ Analysis complete!`);
  console.log(`Total needing enrichment: ${Math.max(noContact, noEmail, genericEmail)}`);
}

analyze().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
