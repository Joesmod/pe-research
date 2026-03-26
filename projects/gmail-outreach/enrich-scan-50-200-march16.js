/**
 * PE Research & Enrichment - Rows 50-200
 * Find leads needing enrichment
 */

const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

const COL = {
  COMPANY: 0,
  WEBSITE: 1,
  CONTACT_NAME: 2,
  TITLE: 3,
  EMAIL: 4,
  LINKEDIN: 6,
  STATUS: 7,
};

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read rows 50-200
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A50:M200',
  });
  
  const rows = res.data.values || [];
  
  console.log('🫡 PE Research & Enrichment - Rows 50-200\n');
  
  const needsEnrichment = [];
  
  for (let i = 0; i < rows.length; i++) {
    const actualRow = i + 50; // Adjust for starting at row 50
    const row = rows[i];
    const company = row[COL.COMPANY] || '';
    const website = row[COL.WEBSITE] || '';
    const contactName = row[COL.CONTACT_NAME] || '';
    const title = row[COL.TITLE] || '';
    const email = row[COL.EMAIL] || '';
    const status = row[COL.STATUS] || '';
    
    // Skip if no company name
    if (!company || company.trim() === '') continue;
    
    // Skip completed/dead leads
    if (['Dead', 'Bounced', 'Sent', 'Replied', 'Scheduled'].includes(status)) {
      continue;
    }
    
    // Check if email field actually contains an email
    const hasValidEmail = email && email.includes('@') && !email.startsWith('http');
    
    // Check for generic emails
    const hasGenericEmail = email && (
      email.includes('info@') || 
      email.includes('sales@') || 
      email.includes('ir@') || 
      email.includes('contact@')
    );
    
    const needsContact = !contactName || contactName.trim() === '' || contactName.startsWith('http');
    const needsRealEmail = !hasValidEmail || hasGenericEmail;
    
    if (needsContact || needsRealEmail) {
      needsEnrichment.push({
        rowIndex: actualRow + 1, // 1-indexed
        company,
        website,
        contactName,
        title,
        email,
        status,
        needsContact,
        needsRealEmail
      });
    }
  }
  
  console.log(`📋 Found ${needsEnrichment.length} leads needing enrichment\n`);
  
  // Take first 15
  const batch = needsEnrichment.slice(0, 15);
  
  if (batch.length === 0) {
    console.log('✅ Rows 50-200 are fully enriched!');
    return [];
  }
  
  console.log('=== BATCH FOR ENRICHMENT ===\n');
  batch.forEach((lead, i) => {
    console.log(`${i + 1}. ${lead.company} (Row ${lead.rowIndex})`);
    console.log(`   Website: ${lead.website || '(none)'}`);
    console.log(`   Contact: ${lead.contactName || '(empty)'}`);
    console.log(`   Title: ${lead.title || '(empty)'}`);
    console.log(`   Email: ${lead.email || '(empty)'}`);
    if (lead.needsContact) console.log(`   ⚠️  Needs contact name`);
    if (lead.needsRealEmail) console.log(`   ⚠️  Needs verified email`);
    console.log('');
  });
  
  console.log('💡 Ready for manual enrichment via web_search\n');
  
  return batch;
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = main;
