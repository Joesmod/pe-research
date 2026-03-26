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
  const notesIdx = 8;
  const status2Idx = 9;
  const notesIdx11 = 11;

  console.log('✅ Scanning for firms needing better contact verification...\n');

  const needsImprovement = [];
  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const company = row[companyIdx] || '';
    const companyUrl = row[companyUrlIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    const title = row[titleIdx] || '';
    const notes = row[notesIdx] || '';
    const status2 = row[status2Idx] || '';
    const notes2 = row[notesIdx11] || '';

    // Skip rows without company names
    if (!company || company.trim() === '') continue;

    // Skip if already sent/replied/dead
    if (['Sent', 'Replied', 'Dead'].includes(status)) continue;

    // Look for indicators of unverified or weak contacts:
    // 1. "email not publicly available"
    // 2. "inferred" or "pattern"
    // 3. Status = "Researched" (not yet "Enriched")
    const combinedText = `${notes} ${notes2}`.toLowerCase();
    const hasUnverified = combinedText.includes('not publicly available') ||
                          combinedText.includes('inferred') ||
                          combinedText.includes('pattern') ||
                          status2 === 'Researched' ||
                          status === 'Researched';

    if (hasUnverified && contact && email) {
      needsImprovement.push({
        rowIndex: i + 2,
        company,
        companyUrl,
        contact,
        title,
        email,
        status,
        status2,
        notes: `${notes} | ${notes2}`.substring(0, 200)
      });
    }
  }

  console.log(`📋 Total firms with unverified/weak contacts: ${needsImprovement.length}`);
  console.log('\n🎯 Top 15 firms to improve:\n');
  
  const top15 = needsImprovement.slice(0, 15);
  top15.forEach((lead, idx) => {
    console.log(`${idx + 1}. ${lead.company}`);
    console.log(`   URL: ${lead.companyUrl || '(none)'}`);
    console.log(`   Current: ${lead.contact} (${lead.title})`);
    console.log(`   Email: ${lead.email}`);
    console.log(`   Status: ${lead.status} / ${lead.status2}`);
    console.log(`   Notes: ${lead.notes}\n`);
  });

  fs.writeFileSync(
    path.join(__dirname, 'unverified-contacts-march17-407am.json'),
    JSON.stringify(top15, null, 2)
  );

  console.log('✅ Saved targets to unverified-contacts-march17-407am.json');
}

main().catch(console.error);
