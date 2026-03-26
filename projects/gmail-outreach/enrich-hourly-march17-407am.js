const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const RANGE = 'Sheet1!A:O';

async function main() {
  // Auth
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'service-account.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth });

  console.log('📊 Reading Google Sheet...');
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: RANGE
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }

  const headers = rows[0];
  console.log('Headers:', headers);

  // Identify columns
  const companyIdx = headers.indexOf('Company');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const statusIdx = headers.indexOf('Status');
  const titleIdx = headers.indexOf('Position/Title');
  const linkedinIdx = headers.indexOf('LinkedIn URL');
  const notesIdx = headers.indexOf('Notes');

  console.log(`\nColumn indices: Company=${companyIdx}, Contact=${contactIdx}, Email=${emailIdx}, Status=${statusIdx}`);

  // Find leads needing enrichment
  const needsEnrichment = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';

    // Skip if status is Sent, Replied, Dead, or Enriched
    if (['Sent', 'Replied', 'Dead', 'Enriched'].includes(status)) continue;

    // Need enrichment if:
    // 1. Empty contact name
    // 2. Empty email
    // 3. Generic email (info@, sales@, ir@, contact@, hello@, support@)
    const hasEmptyContact = !contact || contact.trim() === '';
    const hasEmptyEmail = !email || email.trim() === '';
    const hasGenericEmail = email && /^(info|sales|ir|contact|hello|support|admin|general)@/i.test(email);

    if (hasEmptyContact || hasEmptyEmail || hasGenericEmail) {
      needsEnrichment.push({
        rowIndex: i + 1, // 1-indexed for sheet
        company,
        contact,
        email,
        status,
        reason: hasEmptyContact ? 'empty_contact' : (hasGenericEmail ? 'generic_email' : 'empty_email')
      });
    }
  }

  console.log(`\n✅ Found ${needsEnrichment.length} leads needing enrichment`);
  console.log('\nTop 15 candidates:');
  needsEnrichment.slice(0, 15).forEach((lead, idx) => {
    console.log(`${idx + 1}. Row ${lead.rowIndex}: ${lead.company} | ${lead.contact || '(no contact)'} | ${lead.email || '(no email)'} | Reason: ${lead.reason}`);
  });

  // Save to file for next step
  const fs = require('fs');
  fs.writeFileSync(
    path.join(__dirname, 'enrichment-candidates-march17-407am.json'),
    JSON.stringify(needsEnrichment.slice(0, 15), null, 2)
  );

  console.log('\n📝 Saved candidates to enrichment-candidates-march17-407am.json');
  console.log('\n🔍 Next: Research each firm for decision-makers with verified emails');
}

main().catch(console.error);
