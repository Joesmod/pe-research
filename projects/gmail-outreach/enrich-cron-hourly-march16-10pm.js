const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function main() {
  console.log('📊 PE Research & Enrichment - Hourly Cron\n');
  
  // Authenticate
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  // Read Sheet1
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:K',
  });

  const rows = response.data.values || [];
  console.log(`Total rows: ${rows.length}\n`);

  if (rows.length < 2) {
    console.log('❌ Sheet is empty or has only headers');
    return;
  }

  const headers = rows[0];
  console.log('Headers:', headers);
  console.log();

  // Find rows needing enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const website = row[1] || '';
    const contactName = row[2] || '';
    const title = row[3] || '';
    const email = row[4] || '';
    const status = row[7] || '';

    // Skip if already enriched or dead
    if (status === 'Enriched' || status === 'Dead' || status === 'Sent' || status === 'Replied') {
      continue;
    }

    // Check if needs enrichment:
    // 1. Empty contact name OR
    // 2. Empty/generic email (info@, sales@, ir@, contact@, admin@)
    const hasEmptyContact = !contactName || contactName.trim() === '';
    const genericPrefixes = ['info@', 'sales@', 'ir@', 'contact@', 'admin@', 'hello@', 'support@'];
    const hasGenericEmail = !email || genericPrefixes.some(prefix => email.toLowerCase().startsWith(prefix));

    if (hasEmptyContact || hasGenericEmail) {
      needsEnrichment.push({
        rowIndex: i,
        company,
        website,
        contactName,
        email,
        status,
        reason: hasEmptyContact ? 'Empty contact' : 'Generic/empty email'
      });
    }
  }

  console.log(`🎯 Found ${needsEnrichment.length} firms needing enrichment\n`);

  if (needsEnrichment.length === 0) {
    console.log('✅ No firms need enrichment at this time');
    return;
  }

  // Show first 10
  console.log('First 10 firms needing enrichment:');
  needsEnrichment.slice(0, 10).forEach((lead, idx) => {
    console.log(`\n${idx + 1}. ${lead.company}`);
    console.log(`   Website: ${lead.website || 'N/A'}`);
    console.log(`   Current Contact: ${lead.contactName || '(empty)'}`);
    console.log(`   Current Email: ${lead.email || '(empty)'}`);
    console.log(`   Reason: ${lead.reason}`);
    console.log(`   Row: ${lead.rowIndex + 1}`);
  });

  console.log(`\n\n📝 Next step: Use Apollo API to enrich 10-15 of these leads`);
  console.log('   Search for: C-level, Partners, Directors, VPs, Heads of operations');
  console.log('   Priority: Verified direct emails only (NO guessed patterns)');
}

main().catch(console.error);
