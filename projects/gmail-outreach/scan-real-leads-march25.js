const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

async function scanRealLeads() {
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
  const needsEnrichment = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1;
    
    const company = row[0] || '';
    const website = row[1] || '';
    const contact = row[2] || '';
    const title = row[3] || '';
    const email = row[4] || '';
    const linkedIn = row[6] || '';
    const status = row[7] || '';
    const notes = row[8] || '';

    // Skip rows without a company name - they're not real leads
    if (!company || company.trim() === '') continue;

    // Check if needs enrichment
    const noContact = !contact || contact.trim() === '';
    const genericEmail = email && (
      email.toLowerCase().includes('info@') ||
      email.toLowerCase().includes('sales@') ||
      email.toLowerCase().includes('ir@') ||
      email.toLowerCase().includes('contact@') ||
      email.toLowerCase().includes('hello@') ||
      email.toLowerCase().includes('support@') ||
      email.toLowerCase().includes('admin@') ||
      email.toLowerCase().includes('team@')
    );
    const emptyEmail = !email || email.trim() === '';

    // Skip if already marked as "Dead" or "Not PE"
    if (status && (status.includes('Dead') || status.includes('Not PE'))) continue;

    if (noContact || genericEmail || emptyEmail) {
      needsEnrichment.push({
        rowNum,
        company,
        website,
        contact,
        title,
        email,
        linkedIn,
        status,
        notes,
        reason: noContact ? 'No contact name' : 
                genericEmail ? 'Generic email' : 
                'No email'
      });
    }
  }

  console.log(`\n🔍 Found ${needsEnrichment.length} PE firms needing enrichment:\n`);
  console.log('=' .repeat(80) + '\n');

  needsEnrichment.slice(0, 15).forEach((lead, idx) => {
    console.log(`${idx + 1}. Row ${lead.rowNum}: ${lead.company}`);
    console.log(`   Website: ${lead.website || '(none)'}`);
    console.log(`   Contact: ${lead.contact || '(EMPTY)'}`);
    console.log(`   Title: ${lead.title || '(none)'}`);
    console.log(`   Email: ${lead.email || '(EMPTY)'}`);
    console.log(`   LinkedIn: ${lead.linkedIn || '(none)'}`);
    console.log(`   Status: ${lead.status || '(none)'}`);
    console.log(`   Reason: ${lead.reason}`);
    console.log('');
  });

  console.log('=' .repeat(80));
  console.log(`\n📊 ENRICHMENT SUMMARY:`);
  console.log(`  Total needing enrichment: ${needsEnrichment.length}`);
  console.log(`  No contact name: ${needsEnrichment.filter(l => l.reason === 'No contact name').length}`);
  console.log(`  Generic email: ${needsEnrichment.filter(l => l.reason === 'Generic email').length}`);
  console.log(`  No email: ${needsEnrichment.filter(l => l.reason === 'No email').length}`);

  return needsEnrichment;
}

scanRealLeads().catch(console.error);
