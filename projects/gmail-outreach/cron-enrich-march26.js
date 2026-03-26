const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = './service-account.json';

async function enrichLeads() {
  console.log('🔍 Starting PE Lead Enrichment - March 26, 2026');
  
  // Load service account
  const serviceAccountAuth = new JWT({
    email: JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE)).client_email,
    key: JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE)).private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);
  await doc.loadInfo();
  
  const sheet = doc.sheetsByIndex[0]; // First sheet
  const rows = await sheet.getRows();
  
  console.log(`📊 Total rows in sheet: ${rows.length}`);
  
  // Find rows needing enrichment
  const needsEnrichment = [];
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const firm = row.get('Firm Name') || '';
    const contact = row.get('Contact Name') || '';
    const email = row.get('Email') || '';
    const status = row.get('Status') || '';
    
    // Skip if already enriched or dead
    if (status.toLowerCase().includes('enriched') || 
        status.toLowerCase().includes('dead') ||
        status.toLowerCase().includes('sent')) {
      continue;
    }
    
    // Check if needs enrichment
    const hasEmptyContact = !contact || contact.trim() === '';
    const hasGenericEmail = email.match(/^(info|sales|ir|contact|hello|admin|support)@/i);
    const hasEmptyEmail = !email || email.trim() === '';
    
    if (hasEmptyContact || hasGenericEmail || hasEmptyEmail) {
      needsEnrichment.push({
        rowIndex: i,
        row: row,
        firm: firm,
        contact: contact,
        email: email,
        status: status,
        reason: hasEmptyContact ? 'No contact name' : 
                hasEmptyEmail ? 'No email' : 'Generic email'
      });
    }
  }
  
  console.log(`\n📋 Found ${needsEnrichment.length} firms needing enrichment`);
  console.log('\n🎯 Top candidates:');
  
  // Show first 15
  const batch = needsEnrichment.slice(0, 15);
  batch.forEach((item, idx) => {
    console.log(`\n${idx + 1}. ${item.firm}`);
    console.log(`   Current: ${item.contact || '[empty]'} | ${item.email || '[empty]'}`);
    console.log(`   Reason: ${item.reason}`);
  });
  
  console.log(`\n\n📝 ENRICHMENT REPORT - ${new Date().toISOString()}`);
  console.log(`Total needing enrichment: ${needsEnrichment.length}`);
  console.log(`Processing batch size: ${batch.length}`);
  
  // Save to file for manual research
  fs.writeFileSync(
    'enrichment-targets-march26.json',
    JSON.stringify(batch.map(b => ({
      firm: b.firm,
      currentContact: b.contact,
      currentEmail: b.email,
      reason: b.reason
    })), null, 2)
  );
  
  console.log(`\n✅ Saved enrichment targets to enrichment-targets-march26.json`);
  console.log(`\n🔬 Next step: Manual research on these firms to find verified contacts`);
}

enrichLeads().catch(console.error);
