const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

async function main() {
  console.log('📊 Reading Google Sheet...\n');
  
  const serviceAccountAuth = new JWT({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];
  const rows = await sheet.getRows();

  console.log(`Total rows: ${rows.length}\n`);

  // Find rows that need enrichment
  const needsEnrichment = [];
  
  for (const row of rows) {
    const company = row.get('Company');
    const contact = row.get('Contact Name') || '';
    const email = row.get('Email') || '';
    const status = row.get('Status') || '';
    
    if (!company || status === 'Dead' || status === 'Sent') continue;
    
    // Need enrichment if: no contact name OR generic/empty email
    const hasNoContact = !contact || contact.trim() === '';
    const hasGenericEmail = !email || 
                           email.includes('info@') || 
                           email.includes('sales@') || 
                           email.includes('ir@') ||
                           email.includes('contact@') ||
                           email.trim() === '';
    
    if (hasNoContact || hasGenericEmail) {
      needsEnrichment.push({
        rowIndex: row.rowNumber,
        company: company,
        contact: contact,
        email: email,
        website: row.get('Website') || row.get('Domain') || '',
        status: status,
        notes: row.get('Notes') || ''
      });
    }
  }

  console.log(`🔍 Found ${needsEnrichment.length} leads needing enrichment\n`);
  
  // Take first 15
  const batch = needsEnrichment.slice(0, 15);
  
  console.log('📋 Batch to enrich:');
  batch.forEach((lead, idx) => {
    console.log(`${idx + 1}. ${lead.company}`);
    console.log(`   Current contact: ${lead.contact || '(empty)'}`);
    console.log(`   Current email: ${lead.email || '(empty)'}`);
    console.log(`   Website: ${lead.website || '(none)'}`);
    console.log('');
  });

  // Save to JSON for manual research
  const fs = require('fs');
  fs.writeFileSync(
    path.join(__dirname, 'enrich-targets-march9-1106am.json'),
    JSON.stringify(batch, null, 2)
  );
  
  console.log('\n✅ Saved to enrich-targets-march9-1106am.json');
  console.log('\n📝 NEXT STEPS:');
  console.log('1. Research each firm for decision-makers');
  console.log('2. Search: site:linkedin.com "[Company]" (CEO|CTO|Partner|Director|VP)');
  console.log('3. Check firm website /team /about /leadership pages');
  console.log('4. Look for published emails on official sources only');
  console.log('5. Update the sheet with findings\n');
}

main().catch(console.error);
