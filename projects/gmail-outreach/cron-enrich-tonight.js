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

  // Read current data
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:P',
  });

  const rows = response.data.values;
  const headers = rows[0];
  
  console.log('Headers:', headers);
  console.log('Total rows:', rows.length - 1);

  // Find columns
  const companyIdx = headers.indexOf('Company');
  const contactIdx = headers.indexOf('Contact Name');
  const titleIdx = headers.indexOf('Position/Title');
  const emailIdx = headers.indexOf('Email');
  const linkedinIdx = headers.indexOf('LinkedIn URL');
  const statusIdx = headers.indexOf('Status');
  const notesIdx = headers.indexOf('Notes');

  // Find leads needing enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';

    // Skip if already sent or status is "Dead"
    if (status.toLowerCase().includes('sent') || status.toLowerCase() === 'dead') {
      continue;
    }

    // Needs enrichment if:
    // 1. No contact name
    // 2. No email or generic email (info@, sales@, ir@, contact@, admin@)
    const isGenericEmail = email && /^(info|sales|ir|contact|admin|support)@/.test(email.toLowerCase());
    
    if (!contact || !email || isGenericEmail) {
      needsEnrichment.push({
        rowIndex: i + 1,
        company,
        contact,
        email,
        status,
        reason: !contact ? 'No contact' : isGenericEmail ? 'Generic email' : 'No email'
      });
    }
  }

  console.log(`\n=== Found ${needsEnrichment.length} leads needing enrichment ===\n`);
  
  // Show first 15
  const batch = needsEnrichment.slice(0, 15);
  batch.forEach(lead => {
    console.log(`Row ${lead.rowIndex}: ${lead.company} - ${lead.reason}`);
    console.log(`  Current: ${lead.contact || '(none)'} / ${lead.email || '(none)'}`);
  });

  return needsEnrichment;
}

main().catch(console.error);
