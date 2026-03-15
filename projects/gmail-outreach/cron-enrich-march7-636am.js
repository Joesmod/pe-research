const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = './service-account.json';

async function main() {
  console.log('🔍 PE Research & Enrichment - March 7, 6:36 AM');
  console.log('='.repeat(60));

  // Auth
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  // Read sheet
  console.log('\n📊 Reading CRM sheet...');
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Outreach Log!A:J',
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('❌ No data found');
    return;
  }

  const headers = rows[0];
  console.log('Headers:', headers);

  // Find columns
  const colCompany = headers.indexOf('Company');
  const colContact = headers.indexOf('Contact Name');
  const colEmail = headers.indexOf('Email');
  const colStatus = headers.indexOf('Status');
  const colTitle = headers.indexOf('Position/Title');
  const colLinkedIn = headers.indexOf('LinkedIn URL');

  console.log(`\nColumn indices: Company=${colCompany}, Contact=${colContact}, Email=${colEmail}, Status=${colStatus}`);

  // Find leads needing enrichment
  const needsEnrichment = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[colCompany] || '';
    const contact = row[colContact] || '';
    const email = row[colEmail] || '';
    const status = row[colStatus] || '';

    // Skip if already enriched or sent
    if (status === 'Enriched' || status === 'Sent' || status === 'Replied') continue;

    // Need enrichment if:
    // 1. No contact name, OR
    // 2. No email, OR
    // 3. Generic email (info@, sales@, ir@, contact@)
    const hasContactName = contact && contact.trim() !== '' && contact !== 'TBD';
    const hasEmail = email && email.trim() !== '';
    const isGenericEmail = /^(info|sales|ir|contact|admin|support)@/i.test(email);

    if (!hasContactName || !hasEmail || isGenericEmail) {
      needsEnrichment.push({
        rowIndex: i + 1, // 1-indexed for Sheets
        company,
        contact,
        email,
        status,
        reason: !hasContactName ? 'No contact name' : isGenericEmail ? 'Generic email' : 'No email'
      });
    }
  }

  console.log(`\n✅ Found ${needsEnrichment.length} leads needing enrichment`);
  
  // Take first 15
  const targets = needsEnrichment.slice(0, 15);
  console.log(`\n🎯 Processing ${targets.length} targets:\n`);
  
  targets.forEach((t, idx) => {
    console.log(`${idx + 1}. ${t.company} (Row ${t.rowIndex}) - ${t.reason}`);
  });

  // Save targets for manual research
  fs.writeFileSync(
    './enrich-targets-march7-636am.json',
    JSON.stringify(targets, null, 2)
  );

  console.log(`\n📝 Targets saved to enrich-targets-march7-636am.json`);
  console.log('\n🔬 Next: Manual research for these targets...');
}

main().catch(console.error);
