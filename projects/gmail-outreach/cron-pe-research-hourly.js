const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

async function main() {
  console.log('🔍 PE Research & Enrichment - Starting hourly run...\n');

  // Authenticate
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Read the sheet
  console.log('📊 Reading sheet...');
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:P',
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('❌ No data found');
    return;
  }

  const headers = rows[0];
  const companyIdx = headers.indexOf('Company');
  const contactNameIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const titleIdx = headers.indexOf('Title');
  const statusIdx = headers.indexOf('Status');
  const notesIdx = headers.indexOf('Notes');
  const linkedinIdx = headers.indexOf('LinkedIn URL');

  console.log(`\n📋 Found ${rows.length - 1} total leads`);

  // Find leads needing enrichment
  const needsEnrichment = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contactName = row[contactNameIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';

    // Skip if already sent or dead
    if (status === 'Sent' || status === 'Dead' || status === 'Replied') continue;

    // Check if needs enrichment
    const hasEmptyContact = !contactName || contactName.trim() === '';
    const hasGenericEmail = email && (
      email.includes('info@') ||
      email.includes('sales@') ||
      email.includes('ir@') ||
      email.includes('contact@')
    );
    const hasEmptyEmail = !email || email.trim() === '';

    if (hasEmptyContact || hasGenericEmail || hasEmptyEmail) {
      needsEnrichment.push({
        rowIndex: i + 1,
        company,
        contactName,
        email,
        status,
        issue: hasEmptyContact ? 'No contact name' : (hasEmptyEmail ? 'No email' : 'Generic email')
      });
    }
  }

  console.log(`\n🎯 Found ${needsEnrichment.length} leads needing enrichment\n`);

  // Take first 10-15
  const toEnrich = needsEnrichment.slice(0, 15);

  console.log('📝 Top 15 leads to enrich:\n');
  toEnrich.forEach((lead, idx) => {
    console.log(`${idx + 1}. ${lead.company} (Row ${lead.rowIndex})`);
    console.log(`   Issue: ${lead.issue}`);
    console.log(`   Current: ${lead.contactName || 'N/A'} | ${lead.email || 'N/A'}`);
    console.log('');
  });

  console.log('\n✅ Analysis complete. Next step: Web research to find verified decision-maker contacts.');
  console.log('Remember: ONLY use contacts found on official sources. NO guessing email patterns.\n');
}

main().catch(console.error);
