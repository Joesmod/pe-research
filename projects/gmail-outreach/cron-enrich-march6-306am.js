const { google } = require('googleapis');

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
  const companyIdx = headers.indexOf('Company');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const statusIdx = headers.indexOf('Status');

  console.log('Scanning for leads needing enrichment...\n');

  const needsEnrichment = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';

    // Skip if already marked as sent, dead, or no company
    if (!company || status === 'Sent' || status === 'Dead' || status === 'No Contact Info') continue;

    // Needs enrichment if no contact name OR has generic email
    const hasGenericEmail = email && (
      email.startsWith('info@') ||
      email.startsWith('sales@') ||
      email.startsWith('ir@') ||
      email.startsWith('contact@') ||
      email.startsWith('hello@')
    );

    if (!contact || hasGenericEmail || !email) {
      needsEnrichment.push({
        rowIndex: i + 1,
        company,
        contact,
        email,
        status
      });
    }
  }

  console.log(`Found ${needsEnrichment.length} leads needing enrichment:\n`);
  needsEnrichment.slice(0, 15).forEach(lead => {
    console.log(`Row ${lead.rowIndex}: ${lead.company}`);
    console.log(`  Contact: ${lead.contact || '(empty)'}`);
    console.log(`  Email: ${lead.email || '(empty)'}`);
    console.log(`  Status: ${lead.status}`);
    console.log('');
  });

  console.log('\n--- Next Steps ---');
  console.log('1. For each firm, I will search for decision-makers using:');
  console.log('   - Firm website team/contact pages');
  console.log('   - LinkedIn (site:linkedin.com queries)');
  console.log('   - Press releases and news');
  console.log('   - SEC filings (if applicable)');
  console.log('2. Target titles: CEO, CTO, COO, Partners, VPs, Directors');
  console.log('3. Only use verified emails from official sources');
  console.log('4. Update the sheet with findings');
}

main().catch(console.error);
