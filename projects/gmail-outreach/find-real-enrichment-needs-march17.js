const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const RANGE = 'Sheet1!A:O';

async function main() {
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
  if (!rows || rows.length <= 1) {
    console.log('No data found.');
    return;
  }

  const dataRows = rows.slice(1);
  
  const companyIdx = 0;
  const companyUrlIdx = 1;
  const contactIdx = 2;
  const titleIdx = 3;
  const emailIdx = 4;
  const linkedinIdx = 6;
  const statusIdx = 7;

  console.log('✅ Scanning for real enrichment candidates (companies with data but missing contacts)...\n');

  const needsEnrichment = [];
  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const company = row[companyIdx] || '';
    const companyUrl = row[companyUrlIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    const title = row[titleIdx] || '';

    // Skip rows without company names (empty trailing rows)
    if (!company || company.trim() === '') continue;

    // Skip if already processed or dead
    if (['Sent', 'Replied', 'Dead'].includes(status)) continue;

    // Skip if has complete valid data
    if (contact && email && !email.match(/^(info|sales|ir|contact|hello|support|admin|general|team)@/i)) {
      continue;
    }

    // Need enrichment
    const hasEmptyContact = !contact || contact.trim() === '';
    const hasEmptyEmail = !email || email.trim() === '';
    const hasGenericEmail = email && /^(info|sales|ir|contact|hello|support|admin|general|team)@/i.test(email);

    if (hasEmptyContact || hasEmptyEmail || hasGenericEmail) {
      needsEnrichment.push({
        rowIndex: i + 2,
        company,
        companyUrl,
        contact: contact || '(empty)',
        title: title || '',
        email: email || '(empty)',
        status,
        reason: hasEmptyContact ? 'empty_contact' : (hasGenericEmail ? 'generic_email' : 'empty_email')
      });
    }
  }

  console.log(`📋 Total firms needing enrichment: ${needsEnrichment.length}`);
  console.log('\n🎯 Top 15 priority firms:\n');
  
  const top15 = needsEnrichment.slice(0, 15);
  top15.forEach((lead, idx) => {
    console.log(`${idx + 1}. ${lead.company}`);
    console.log(`   URL: ${lead.companyUrl || '(none)'}`);
    console.log(`   Row: ${lead.rowIndex} | Contact: ${lead.contact} | Email: ${lead.email}`);
    console.log(`   Reason: ${lead.reason}\n`);
  });

  fs.writeFileSync(
    path.join(__dirname, 'enrichment-targets-march17-407am.json'),
    JSON.stringify(top15, null, 2)
  );

  console.log('✅ Saved top 15 targets to enrichment-targets-march17-407am.json');
  console.log('\n🔍 Next: Research decision-makers for each firm');
}

main().catch(console.error);
