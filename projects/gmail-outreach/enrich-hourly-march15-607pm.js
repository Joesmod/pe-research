const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const RANGE = 'Sheet1!A:O';

async function getSheetData() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'service-account.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: RANGE,
  });

  return response.data.values;
}

function findEnrichmentNeeds(rows) {
  if (!rows || rows.length === 0) return [];
  
  const headers = rows[0];
  const companyIdx = headers.indexOf('Company');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const statusIdx = headers.indexOf('Status');
  const titleIdx = headers.indexOf('Position/Title');
  
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const status = (row[statusIdx] || '').trim();
    const contact = (row[contactIdx] || '').trim();
    const email = (row[emailIdx] || '').trim();
    const company = (row[companyIdx] || '').trim();
    
    // Skip if Status is Dead, Sent, Replied, or Scheduled
    if (['Dead', 'Sent', 'Replied', 'Scheduled'].includes(status)) continue;
    
    // Skip if no company name
    if (!company) continue;
    
    // Needs enrichment if:
    // 1. No contact name, OR
    // 2. No email, OR
    // 3. Generic email (info@, sales@, ir@, contact@, hello@, support@, admin@)
    const isGenericEmail = email && /^(info|sales|ir|contact|hello|support|admin)@/i.test(email);
    
    if (!contact || !email || isGenericEmail) {
      needsEnrichment.push({
        row: i + 1,
        company,
        contact,
        email,
        status,
        reason: !contact ? 'Missing contact' : (!email ? 'Missing email' : 'Generic email')
      });
    }
  }
  
  return needsEnrichment;
}

async function main() {
  console.log('Reading Google Sheet...');
  const rows = await getSheetData();
  
  console.log(`Total rows: ${rows.length}`);
  
  const needs = findEnrichmentNeeds(rows);
  console.log(`\nFirms needing enrichment: ${needs.length}`);
  
  // Show first 15
  console.log('\nFirst 15 targets for enrichment:');
  needs.slice(0, 15).forEach((n, idx) => {
    console.log(`${idx + 1}. Row ${n.row}: ${n.company}`);
    console.log(`   Reason: ${n.reason}`);
    console.log(`   Current: ${n.contact || '(none)'} | ${n.email || '(none)'}`);
    console.log('');
  });
  
  return needs.slice(0, 15);
}

main().catch(console.error);
