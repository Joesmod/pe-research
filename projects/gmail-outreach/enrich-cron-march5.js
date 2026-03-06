const { google } = require('googleapis');
const key = require('./service-account.json');

const jwtClient = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  ['https://www.googleapis.com/auth/spreadsheets']
);

const sheets = google.sheets({ version: 'v4', auth: jwtClient });
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function readSheet() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:M'
  });
  
  return res.data.values || [];
}

async function updateRow(rowIndex, updates) {
  // updates is an object like { C: "John Doe", D: "CEO", E: "john@example.com" }
  for (const [col, value] of Object.entries(updates)) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Sheet1!${col}${rowIndex}`,
      valueInputOption: 'RAW',
      resource: { values: [[value]] }
    });
  }
}

async function main() {
  const rows = await readSheet();
  const headers = rows[0];
  
  console.log('Headers:', headers);
  console.log(`Total rows: ${rows.length}`);
  
  // Find columns
  const companyCol = headers.indexOf('Company Name');
  const contactCol = headers.indexOf('Contact Name');
  const titleCol = headers.indexOf('Title');
  const emailCol = headers.indexOf('Email');
  const linkedinCol = headers.indexOf('LinkedIn');
  const statusCol = headers.indexOf('Status');
  const notesCol = headers.indexOf('Notes');
  
  // Find leads needing enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyCol] || '';
    const contact = row[contactCol] || '';
    const email = row[emailCol] || '';
    const status = row[statusCol] || '';
    
    // Skip if already marked as Dead/Sent/Enriched
    if (status === 'Dead' || status === 'Sent' || status === 'Enriched') {
      continue;
    }
    
    // Need enrichment if: no contact name OR generic email
    const isGeneric = email.match(/^(info@|sales@|ir@|contact@|hello@)/i);
    const needsEnrich = !contact || !email || isGeneric;
    
    if (needsEnrich && company) {
      needsEnrichment.push({
        rowIndex: i + 1,
        company,
        contact,
        email,
        status
      });
    }
  }
  
  console.log(`\nFound ${needsEnrichment.length} leads needing enrichment`);
  console.log(JSON.stringify(needsEnrichment.slice(0, 15), null, 2));
  
  return needsEnrichment;
}

main().catch(console.error);
