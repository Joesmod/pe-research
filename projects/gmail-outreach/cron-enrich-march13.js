const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = './service-account.json';

async function main() {
  console.log('=== PE ENRICHMENT RUN - MARCH 13 12:37 AM ===\n');

  // Authenticate
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Read current sheet data
  console.log('Reading sheet...');
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:R',
  });

  const rows = res.data.values;
  const headers = rows[0];
  console.log(`Headers: ${headers.join(', ')}\n`);

  // Find column indices
  const companyIdx = headers.indexOf('Company');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const statusIdx = headers.indexOf('Status');
  const notesIdx = headers.indexOf('Notes');

  // Find leads needing enrichment
  const needsEnrichment = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';

    // Skip if already sent or dead
    if (status.toLowerCase().includes('sent') || status.toLowerCase().includes('dead')) continue;

    // Check if needs enrichment
    const needsContact = !contact || contact.trim() === '';
    const hasGenericEmail = email && (
      email.toLowerCase().startsWith('info@') ||
      email.toLowerCase().startsWith('sales@') ||
      email.toLowerCase().startsWith('ir@') ||
      email.toLowerCase().startsWith('contact@')
    );
    const needsEmail = !email || email.trim() === '';

    if (needsContact || hasGenericEmail || needsEmail) {
      needsEnrichment.push({
        rowNum: i + 1,
        company,
        contact,
        email,
        status,
        reason: needsContact ? 'No contact' : hasGenericEmail ? 'Generic email' : 'No email'
      });
    }
  }

  console.log(`\nFound ${needsEnrichment.length} leads needing enrichment\n`);

  // Take first 15
  const batch = needsEnrichment.slice(0, 15);
  
  console.log('TOP 15 LEADS FOR ENRICHMENT:\n');
  batch.forEach((lead, idx) => {
    console.log(`${idx + 1}. ${lead.company} (Row ${lead.rowNum})`);
    console.log(`   Contact: ${lead.contact || '(empty)'}`);
    console.log(`   Email: ${lead.email || '(empty)'}`);
    console.log(`   Reason: ${lead.reason}\n`);
  });

  // Save to JSON for manual research
  fs.writeFileSync(
    './enrichment-targets-march13-1237am.json',
    JSON.stringify(batch, null, 2)
  );

  console.log('\n✓ Saved enrichment targets to enrichment-targets-march13-1237am.json');
  console.log('\nNEXT STEPS:');
  console.log('1. For each firm: search website team pages, LinkedIn, press releases');
  console.log('2. Find C-level, Partner, Director, VP, or Head of positions');
  console.log('3. Verify email from official sources (NO guessing!)');
  console.log('4. Update sheet with Contact Name, Title, Email, LinkedIn URL');
  console.log('5. Set Status to "Enriched" when complete');
}

main().catch(console.error);
