const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = './service-account.json';

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Read the sheet
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
  const companyIdx = headers.indexOf('Company Name');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const statusIdx = headers.indexOf('Status');
  const websiteIdx = headers.indexOf('Website') || headers.indexOf('NotebookLM');
  const titleIdx = headers.indexOf('Title');
  const linkedinIdx = headers.indexOf('LinkedIn');

  console.log('Headers:', headers);
  console.log('Column indices: Company=' + companyIdx + ', Contact=' + contactIdx + ', Email=' + emailIdx + ', Status=' + statusIdx);
  console.log('\nScanning for leads needing enrichment...\n');

  const needsEnrichment = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    const website = row[websiteIdx] || '';
    const title = row[titleIdx] || '';

    // Skip if no company name
    if (!company || !company.trim()) continue;

    // Skip if already sent or dead
    if (status === 'Sent' || status === 'Dead' || status === 'No Contact Info') continue;

    // Check if email is generic
    const hasGenericEmail = email && (
      email.toLowerCase().startsWith('info@') ||
      email.toLowerCase().startsWith('sales@') ||
      email.toLowerCase().startsWith('ir@') ||
      email.toLowerCase().startsWith('contact@') ||
      email.toLowerCase().startsWith('hello@') ||
      email.toLowerCase().startsWith('support@') ||
      email.toLowerCase().startsWith('inquiries@') ||
      email.toLowerCase().startsWith('admin@')
    );

    // Needs enrichment if:
    // 1. No contact name OR
    // 2. Has generic email OR
    // 3. No email at all OR
    // 4. Status is not already "Enriched"
    const noContact = !contact || !contact.trim();
    const noEmail = !email || !email.trim();
    const notEnriched = status !== 'Enriched';

    if ((noContact || hasGenericEmail || noEmail) && notEnriched) {
      needsEnrichment.push({
        rowIndex: i + 1,
        company,
        contact: contact || '(empty)',
        email: email || '(empty)',
        status,
        website,
        title: title || '(empty)',
        reason: [
          noContact ? 'No contact' : null,
          hasGenericEmail ? 'Generic email' : null,
          noEmail ? 'No email' : null,
          notEnriched ? 'Not enriched' : null
        ].filter(Boolean).join(', ')
      });
    }
  }

  console.log(`Found ${needsEnrichment.length} leads needing enrichment\n`);

  // Show first 15
  const toShow = needsEnrichment.slice(0, 15);
  toShow.forEach((lead, idx) => {
    console.log(`${idx + 1}. Row ${lead.rowIndex}: ${lead.company}`);
    console.log(`   Contact: ${lead.contact}`);
    console.log(`   Email: ${lead.email}`);
    console.log(`   Status: ${lead.status || '(empty)'}`);
    console.log(`   Website: ${lead.website}`);
    console.log(`   Reason: ${lead.reason}`);
    console.log('');
  });

  // Save all to file
  fs.writeFileSync('needs-enrichment-march6-306am.json', JSON.stringify(needsEnrichment, null, 2));
  console.log(`\nAll ${needsEnrichment.length} leads saved to needs-enrichment-march6-306am.json`);

  console.log('\n--- Starting Enrichment Process ---');
  console.log('I will now research these firms to find:');
  console.log('- C-suite: CEO, CTO, COO, CMO, CFO');
  console.log('- Partners: Managing, Operating, General Partner');
  console.log('- Directors: Technology, Product, Operations, Marketing');
  console.log('- VPs: Technology, Operations, Digital, Portfolio Ops');
  console.log('- Heads of: Value Creation, Portfolio Ops, BD');
  console.log('\nSearch sources: team pages, LinkedIn, press, SEC filings');
  console.log('Only official/published emails, NO guesses');
}

main().catch(console.error);
