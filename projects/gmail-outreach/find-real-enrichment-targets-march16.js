const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:K',
  });

  const rows = response.data.values || [];
  console.log(`📊 Total rows: ${rows.length}\n`);

  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = (row[0] || '').trim();
    const website = (row[1] || '').trim();
    const contactName = (row[2] || '').trim();
    const title = (row[3] || '').trim();
    const email = (row[4] || '').trim();
    const status = (row[7] || '').trim();

    // MUST have a company name
    if (!company) continue;

    // Skip if already enriched, dead, sent, or replied
    if (['Enriched', 'Dead', 'Sent', 'Replied', 'Enriched - Needs Email Verification'].includes(status)) {
      continue;
    }

    // Check if needs enrichment:
    // 1. Empty contact name OR
    // 2. Empty/generic email
    const hasEmptyContact = !contactName;
    const genericPrefixes = ['info@', 'sales@', 'ir@', 'contact@', 'admin@', 'hello@', 'support@', 'careers@'];
    const hasGenericEmail = !email || genericPrefixes.some(prefix => email.toLowerCase().startsWith(prefix));

    if (hasEmptyContact || hasGenericEmail) {
      needsEnrichment.push({
        rowIndex: i,
        company,
        website,
        contactName: contactName || '(empty)',
        title: title || '(empty)',
        email: email || '(empty)',
        status: status || '(empty)',
        reason: hasEmptyContact ? 'Empty contact name' : 'Generic/empty email'
      });
    }
  }

  console.log(`🎯 Found ${needsEnrichment.length} firms needing enrichment\n`);

  if (needsEnrichment.length === 0) {
    console.log('✅ No firms need enrichment');
    return;
  }

  // Show first 15
  console.log('First 15 firms needing enrichment:\n');
  needsEnrichment.slice(0, 15).forEach((lead, idx) => {
    console.log(`${idx + 1}. ${lead.company}`);
    console.log(`   Website: ${lead.website || 'N/A'}`);
    console.log(`   Contact: ${lead.contactName}`);
    console.log(`   Title: ${lead.title}`);
    console.log(`   Email: ${lead.email}`);
    console.log(`   Status: ${lead.status}`);
    console.log(`   Reason: ${lead.reason}`);
    console.log(`   Row: ${lead.rowIndex + 1}`);
    console.log();
  });

  console.log(`\n📝 Total targets found: ${needsEnrichment.length}`);
  console.log('   Next: Research 10-15 using Apollo API + manual web search');
}

main().catch(console.error);
