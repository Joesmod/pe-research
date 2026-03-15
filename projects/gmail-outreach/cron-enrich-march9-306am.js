const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  console.log('📖 Reading sheet...');
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:K',
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }

  const headers = rows[0];
  const companyIdx = headers.indexOf('Company');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const statusIdx = headers.indexOf('Status');
  const notesIdx = headers.indexOf('Notes');

  console.log(`\nHeaders: ${headers.join(', ')}`);
  console.log(`Company col: ${companyIdx}, Contact col: ${contactIdx}, Email col: ${emailIdx}, Status col: ${statusIdx}\n`);

  const needsEnrichment = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';

    // Skip if status is Dead, Sent, or Replied
    if (status === 'Dead' || status === 'Sent' || status === 'Replied') continue;

    // Needs enrichment if:
    // - Empty contact name OR
    // - Empty/generic email (info@, sales@, ir@, contact@)
    const hasEmptyContact = !contact || contact.trim() === '';
    const hasGenericEmail = !email || email.trim() === '' ||
      email.toLowerCase().startsWith('info@') ||
      email.toLowerCase().startsWith('sales@') ||
      email.toLowerCase().startsWith('ir@') ||
      email.toLowerCase().startsWith('contact@');

    if (hasEmptyContact || hasGenericEmail) {
      needsEnrichment.push({
        rowIndex: i + 1,
        company,
        contact: contact || '(empty)',
        email: email || '(empty)',
        status,
        reason: hasEmptyContact && hasGenericEmail ? 'Empty contact + generic email' :
                hasEmptyContact ? 'Empty contact' : 'Generic/empty email'
      });
    }
  }

  console.log(`\n🔍 Found ${needsEnrichment.length} leads needing enrichment:\n`);
  needsEnrichment.slice(0, 15).forEach(lead => {
    console.log(`Row ${lead.rowIndex}: ${lead.company}`);
    console.log(`  Contact: ${lead.contact} | Email: ${lead.email}`);
    console.log(`  Status: ${lead.status} | Reason: ${lead.reason}\n`);
  });

  // Save targets for enrichment
  const targetsFile = 'enrich-targets-march9-306am.json';
  fs.writeFileSync(targetsFile, JSON.stringify(needsEnrichment.slice(0, 15), null, 2));
  console.log(`✅ Saved ${Math.min(15, needsEnrichment.length)} targets to ${targetsFile}`);
}

main().catch(console.error);
