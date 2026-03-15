const { google } = require('googleapis');
const fs = require('fs');
const key = require('./service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  // Read the sheet
  console.log('Reading sheet...');
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:L',
  });

  const rows = res.data.values || [];
  if (rows.length === 0) {
    console.log('No data found.');
    return;
  }

  const headers = rows[0];
  console.log('Headers:', headers);
  console.log(`Total rows: ${rows.length}`);

  // Find columns
  const companyIdx = headers.indexOf('Company Name');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const statusIdx = headers.indexOf('Status');
  const titleIdx = headers.indexOf('Title');
  const linkedinIdx = headers.indexOf('LinkedIn URL');

  console.log(`\nColumn indexes: Company=${companyIdx}, Contact=${contactIdx}, Email=${emailIdx}, Status=${statusIdx}`);

  // Find leads needing enrichment
  const needsEnrichment = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';

    const isGenericEmail = email && (email.includes('info@') || email.includes('sales@') || email.includes('ir@') || email.includes('contact@'));
    const needsContact = !contact || contact.trim() === '';
    const needsEmail = !email || email.trim() === '' || isGenericEmail;

    if (company && status !== 'Dead' && (needsContact || needsEmail)) {
      needsEnrichment.push({
        row: i + 1,
        company,
        contact,
        email,
        status,
        reason: needsContact ? 'Missing contact name' : 'Missing/generic email'
      });
    }
  }

  console.log(`\nFound ${needsEnrichment.length} leads needing enrichment:`);
  needsEnrichment.slice(0, 20).forEach(lead => {
    console.log(`Row ${lead.row}: ${lead.company} - ${lead.reason}`);
  });

  // Save to file
  fs.writeFileSync(
    'enrich-targets-march6-1136pm.json',
    JSON.stringify(needsEnrichment, null, 2)
  );

  console.log(`\nSaved ${needsEnrichment.length} targets to enrich-targets-march6-1136pm.json`);
}

main().catch(console.error);
