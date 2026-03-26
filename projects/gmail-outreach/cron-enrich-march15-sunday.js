const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  console.log('📖 Reading Google Sheet...');
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:M',
  });

  const rows = res.data.values || [];
  const headers = rows[0];
  console.log(`Total rows: ${rows.length}`);

  const companyIdx = 0;
  const contactIdx = 2;
  const titleIdx = 3;
  const emailIdx = 4;
  const statusIdx = 9;

  // Find leads that need enrichment: empty contact name OR generic/empty email
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const title = row[titleIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';

    // Skip if already enriched or dead
    if (status === 'Enriched' || status === 'Dead') continue;

    const emailLower = email.toLowerCase();
    const isGenericEmail = emailLower.startsWith('info@') || 
                          emailLower.startsWith('sales@') || 
                          emailLower.startsWith('ir@') ||
                          emailLower.startsWith('investor@') ||
                          emailLower.startsWith('contact@');

    const needsContact = !contact || contact.trim() === '';
    const needsEmail = !email || isGenericEmail;

    if (needsContact || needsEmail) {
      needsEnrichment.push({
        rowIndex: i + 1,
        company,
        contact,
        title,
        email,
        status,
        reason: needsContact ? 'No contact name' : 'Generic/missing email'
      });
    }
  }

  console.log(`\n🎯 Found ${needsEnrichment.length} leads needing enrichment\n`);

  // Take top 15 for this run
  const targets = needsEnrichment.slice(0, 15);
  
  console.log('TARGET LIST FOR ENRICHMENT:\n');
  targets.forEach((target, idx) => {
    console.log(`${idx + 1}. ${target.company} (Row ${target.rowIndex})`);
    console.log(`   Current: ${target.contact || '(none)'} <${target.email || '(none)'}>`);
    console.log(`   Reason: ${target.reason}\n`);
  });

  // Save to file for reference
  fs.writeFileSync(
    path.join(__dirname, 'enrichment-targets-march15.json'),
    JSON.stringify(targets, null, 2)
  );

  console.log(`\n✅ Saved ${targets.length} targets to enrichment-targets-march15.json`);
  
  return targets;
}

main().catch(console.error);
