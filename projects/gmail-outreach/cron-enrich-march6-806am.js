const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = require('./service-account.json');

async function main() {
  const auth = new google.auth.GoogleAuth({
    credentials: SERVICE_ACCOUNT,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Read the current sheet data
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:J',
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }

  const headers = rows[0];
  console.log('Headers:', headers);

  // Find columns
  const firmIdx = headers.indexOf('Company Name');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const statusIdx = headers.indexOf('Status');
  const titleIdx = headers.indexOf('Title');
  const linkedinIdx = headers.indexOf('LinkedIn');
  const websiteIdx = headers.indexOf('Website');

  console.log(`\nColumn indices: Firm=${firmIdx}, Contact=${contactIdx}, Email=${emailIdx}, Status=${statusIdx}`);

  // Find leads needing enrichment
  const needsEnrichment = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const firm = row[firmIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    const title = row[titleIdx] || '';

    // Skip if status is Dead/Invalid/Sent
    if (status && (status.includes('Dead') || status.includes('Invalid') || status === 'Sent')) {
      continue;
    }

    // Check if needs enrichment
    const needsContact = !contact || contact.trim() === '';
    const hasGenericEmail = email && (email.startsWith('info@') || email.startsWith('sales@') || email.startsWith('ir@') || email.startsWith('contact@'));
    const noEmail = !email || email.trim() === '';

    if (firm && (needsContact || hasGenericEmail || noEmail)) {
      needsEnrichment.push({
        rowIndex: i,
        firm,
        contact,
        email,
        title,
        status,
        reason: needsContact ? 'No contact name' : (hasGenericEmail ? 'Generic email' : 'No email')
      });
    }
  }

  console.log(`\n\nFound ${needsEnrichment.length} leads needing enrichment:`);
  console.log(JSON.stringify(needsEnrichment.slice(0, 15), null, 2));

  // Save to file
  fs.writeFileSync('leads-needing-enrichment-806am.json', JSON.stringify(needsEnrichment, null, 2));
  console.log(`\n✅ Saved ${needsEnrichment.length} leads to leads-needing-enrichment-806am.json`);
}

main().catch(console.error);
