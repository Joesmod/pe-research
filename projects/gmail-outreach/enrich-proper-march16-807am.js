/**
 * PE Research & Enrichment - Hourly Cron  
 * Hardcoded column indices based on actual sheet structure
 */

const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

// Hardcoded column indices (0-based)
const COL = {
  COMPANY: 0,
  WEBSITE: 1,
  CONTACT_NAME: 2,
  TITLE: 3,
  EMAIL: 4,
  LINKEDIN: 6,
  STATUS: 7, // or 9?
  NOTES: 8, // or 11?
};

async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function findLeadsNeedingEnrichment() {
  const sheets = await getSheets();
  
  // Read Sheet1 (all rows, no header skip since row 1 is data)
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:M',
  });
  
  const rows = res.data.values || [];
  if (rows.length === 0) return [];
  
  const needsEnrichment = [];
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const company = row[COL.COMPANY] || '';
    const website = row[COL.WEBSITE] || '';
    const contactName = row[COL.CONTACT_NAME] || '';
    const email = row[COL.EMAIL] || '';
    const status = row[COL.STATUS] || '';
    
    // Skip completed/dead leads
    if (['Dead', 'Bounced', 'Sent', 'Replied', 'Scheduled'].includes(status)) {
      continue;
    }
    
    // Check if needs enrichment
    const hasGenericEmail = email && (
      email.includes('info@') || 
      email.includes('sales@') || 
      email.includes('ir@') || 
      email.includes('contact@') ||
      email.includes('http://') || // Sometimes URLs sneak in
      email.includes('https://')
    );
    
    const needsContact = !contactName || contactName.trim() === '' || contactName.startsWith('http');
    const needsRealEmail = !email || email.trim() === '' || hasGenericEmail || !email.includes('@');
    
    if (needsContact || needsRealEmail) {
      needsEnrichment.push({
        rowIndex: i + 1, // 1-indexed for Google Sheets
        company,
        website,
        contactName,
        email,
        status,
        needsContact,
        needsRealEmail
      });
    }
  }
  
  return needsEnrichment.slice(0, 15);
}

async function main() {
  console.log('🫡 PE Research & Enrichment - March 16, 8:07 AM\n');
  
  const leads = await findLeadsNeedingEnrichment();
  
  console.log(`📋 Found ${leads.length} leads needing enrichment\n`);
  
  if (leads.length === 0) {
    console.log('✅ All leads are enriched!');
    return;
  }
  
  // Display in groups
  console.log('=== LEADS NEEDING ENRICHMENT ===\n');
  leads.forEach((lead, i) => {
    console.log(`${i + 1}. ${lead.company} (Row ${lead.rowIndex})`);
    console.log(`   Website: ${lead.website}`);
    console.log(`   Contact: ${lead.contactName || '(empty)'}`);
    console.log(`   Email: ${lead.email || '(empty)'}`);
    console.log(`   Status: ${lead.status || '(empty)'}`);
    if (lead.needsContact) console.log(`   ⚠️  Missing contact name`);
    if (lead.needsRealEmail) console.log(`   ⚠️  Missing/generic email`);
    console.log('');
  });
  
  console.log('\n💡 NEXT: Manual research for each firm');
  console.log('Target roles: CEO, CTO, COO, Managing Partner, Operating Partner, VP Tech');
  console.log('Verify emails from: team pages, press releases, official PDFs, conference bios');
  console.log('\nReady for web_search research...');
  
  return leads;
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { findLeadsNeedingEnrichment, COL };
