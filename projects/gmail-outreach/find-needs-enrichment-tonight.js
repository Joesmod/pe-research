const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_KEY = path.join(__dirname, 'service-account.json');

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Read current data (skip row 1 which has mixed headers/data)
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A2:N',
  });

  const rows = response.data.values;
  
  console.log(`Total rows: ${rows.length}`);

  // Column indices (0-based, after skipping header row)
  const COL_COMPANY = 0;      // A
  const COL_WEBSITE = 1;       // B
  const COL_CONTACT = 2;       // C
  const COL_TITLE = 3;         // D
  const COL_EMAIL = 4;         // E
  const COL_LINKEDIN = 6;      // G
  const COL_STATUS = 9;        // J

  const needsEnrichment = [];
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const company = row[COL_COMPANY] || '';
    const contact = row[COL_CONTACT] || '';
    const email = row[COL_EMAIL] || '';
    const status = row[COL_STATUS] || '';

    // Skip if no company or status is Dead/Sent
    if (!company) continue;
    if (status.toLowerCase().includes('sent') || status.toLowerCase() === 'dead') {
      continue;
    }

    // Needs enrichment if:
    // 1. No contact name
    // 2. No email or generic email
    const isGenericEmail = email && /^(info|sales|ir|contact|admin|support|media)@/.test(email.toLowerCase());
    
    if (!contact || !email || isGenericEmail) {
      needsEnrichment.push({
        rowIndex: i + 2, // +2 because we skipped header and arrays are 0-indexed
        company,
        contact: contact || '(none)',
        email: email || '(none)',
        status,
        reason: !contact ? 'Missing contact' : isGenericEmail ? 'Generic email' : 'Missing email'
      });
    }
  }

  console.log(`\n=== Found ${needsEnrichment.length} leads needing enrichment ===\n`);
  
  // Show first 15
  const batch = needsEnrichment.slice(0, 15);
  batch.forEach(lead => {
    console.log(`Row ${lead.rowIndex}: ${lead.company}`);
    console.log(`  Issue: ${lead.reason}`);
    console.log(`  Current: ${lead.contact} / ${lead.email}`);
    console.log('');
  });

  console.log(`\nNext step: Research these ${Math.min(15, needsEnrichment.length)} firms for decision-maker contacts with direct emails.`);
  
  return needsEnrichment.slice(0, 15);
}

main().catch(console.error);
