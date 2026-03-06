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
  const notebookIdx = headers.indexOf('NotebookLM');

  console.log('Scanning for ACTIVE leads needing enrichment...\n');

  const needsEnrichment = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = (row[statusIdx] || '').toLowerCase();
    const website = row[websiteIdx] || row[notebookIdx] || '';
    const title = row[titleIdx] || '';

    // Skip if no company name
    if (!company || !company.trim()) continue;

    // CRITICAL: Skip ANY dead/inactive status
    if (status.includes('dead') || 
        status.includes('sent') || 
        status === 'no contact info' ||
        status.includes('acquired') ||
        status.includes('not pe')) {
      continue;
    }

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
    // 3. No email at all
    const noContact = !contact || !contact.trim();
    const noEmail = !email || !email.trim();
    const notYetEnriched = status !== 'enriched';

    if ((noContact || hasGenericEmail || noEmail) && notYetEnriched) {
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
          noEmail ? 'No email' : null
        ].filter(Boolean).join(', ')
      });
    }
  }

  console.log(`Found ${needsEnrichment.length} ACTIVE leads needing enrichment\n`);

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
  fs.writeFileSync('active-needs-march6-306am.json', JSON.stringify(needsEnrichment, null, 2));
  console.log(`\nAll ${needsEnrichment.length} active leads saved to active-needs-march6-306am.json`);

  console.log('\n=== ENRICHMENT PLAN ===');
  console.log('Will enrich first 10-15 leads using:');
  console.log('1. Company website team/leadership pages');
  console.log('2. LinkedIn (site:linkedin.com "[company name]" [title])');
  console.log('3. Press releases, news articles');
  console.log('4. SEC filings (if public/reporting)');
  console.log('\nTarget decision-makers:');
  console.log('- C-suite: CEO, CTO, COO, CMO, CFO, Chief Digital Officer');
  console.log('- Partners: Managing, Operating, General, Senior Partner');
  console.log('- VPs: Technology, Operations, Digital Transformation, Portfolio');
  console.log('- Directors: Technology, Product, Operations, Marketing, BD');
  console.log('- Heads of: Value Creation, Portfolio Ops, Digital, Innovation');
  console.log('\nONLY use verified emails from official sources. NO email pattern guessing.');
}

main().catch(console.error);
