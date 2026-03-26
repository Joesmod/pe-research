const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = require('./service-account.json');

async function readSheet() {
  const auth = new google.auth.GoogleAuth({
    credentials: SERVICE_ACCOUNT,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:Z',
  });

  return response.data.values || [];
}

async function main() {
  console.log('Reading sheet...');
  const rows = await readSheet();
  
  if (!rows.length) {
    console.log('No data found.');
    return;
  }

  const headers = rows[0];
  console.log('Headers:', headers);
  
  // Find index positions
  const companyIdx = headers.indexOf('Company/Firm');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const statusIdx = headers.indexOf('Status');
  const titleIdx = headers.indexOf('Position/Title');
  
  console.log('\nColumn indices:', { companyIdx, contactIdx, emailIdx, statusIdx, titleIdx });
  
  // Identify leads needing enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    
    // Skip if status is Dead, Not Relevant, or Sent
    if (['Dead', 'Not Relevant', 'Sent'].includes(status)) continue;
    
    // Check if needs enrichment:
    // 1. Empty contact name
    // 2. Generic email (info@, sales@, ir@, contact@, support@)
    const hasGenericEmail = email && /^(info|sales|ir|contact|support|hello|admin)@/i.test(email);
    const needsContact = !contact || contact.trim() === '';
    
    if (needsContact || hasGenericEmail) {
      needsEnrichment.push({
        rowIndex: i,
        company,
        contact,
        email,
        status,
        reason: needsContact ? 'No contact name' : 'Generic email'
      });
    }
  }
  
  console.log(`\nFound ${needsEnrichment.length} leads needing enrichment:`);
  needsEnrichment.slice(0, 20).forEach((lead, idx) => {
    console.log(`${idx + 1}. ${lead.company} - ${lead.reason} (Row ${lead.rowIndex + 1})`);
  });
  
  // Save for processing
  fs.writeFileSync(
    path.join(__dirname, 'enrichment-candidates-march17-837am.json'),
    JSON.stringify(needsEnrichment, null, 2)
  );
  
  console.log(`\nSaved ${needsEnrichment.length} candidates to enrichment-candidates-march17-837am.json`);
}

main().catch(console.error);
