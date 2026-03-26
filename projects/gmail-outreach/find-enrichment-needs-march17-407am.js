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

  // Skip header row
  const dataRows = rows.slice(1);
  
  // Column indices based on inspection
  const companyIdx = 0;  // Company Name
  const contactIdx = 2;   // Contact Name
  const titleIdx = 3;     // Position/Title
  const emailIdx = 4;     // Email
  const linkedinIdx = 6;  // LinkedIn URL
  const statusIdx = 7;    // Status
  const notesIdx = 8;     // Notes

  console.log('✅ Scanning for enrichment candidates...\n');

  const needsEnrichment = [];
  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    const title = row[titleIdx] || '';

    // Skip if already processed or dead
    if (['Sent', 'Replied', 'Dead'].includes(status)) continue;

    // Skip if has good data already
    if (contact && email && !email.match(/^(info|sales|ir|contact|hello|support|admin|general|team)@/i)) {
      continue;
    }

    // Need enrichment if:
    // 1. Empty contact name
    // 2. Empty email
    // 3. Generic email
    const hasEmptyContact = !contact || contact.trim() === '';
    const hasEmptyEmail = !email || email.trim() === '';
    const hasGenericEmail = email && /^(info|sales|ir|contact|hello|support|admin|general|team)@/i.test(email);

    if (hasEmptyContact || hasEmptyEmail || hasGenericEmail) {
      needsEnrichment.push({
        rowIndex: i + 2, // +2 because: 1 for header, 1 for 1-indexing
        company,
        contact: contact || '(empty)',
        title: title || '',
        email: email || '(empty)',
        status,
        reason: hasEmptyContact ? 'empty_contact' : (hasGenericEmail ? 'generic_email' : 'empty_email')
      });
    }
  }

  console.log(`📋 Total candidates needing enrichment: ${needsEnrichment.length}`);
  console.log('\n🎯 Top 15 priority leads:\n');
  
  const top15 = needsEnrichment.slice(0, 15);
  top15.forEach((lead, idx) => {
    console.log(`${idx + 1}. ${lead.company}`);
    console.log(`   Row: ${lead.rowIndex} | Contact: ${lead.contact} | Email: ${lead.email}`);
    console.log(`   Reason: ${lead.reason} | Status: ${lead.status || 'none'}\n`);
  });

  fs.writeFileSync(
    path.join(__dirname, 'enrichment-candidates-march17-407am.json'),
    JSON.stringify(top15, null, 2)
  );

  console.log('✅ Saved top 15 candidates to enrichment-candidates-march17-407am.json');
  console.log('\n🔍 Next step: Manual research for each firm');
}

main().catch(console.error);
