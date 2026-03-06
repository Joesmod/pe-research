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

async function main() {
  const rows = await readSheet();
  const headers = rows[0];
  
  // Find columns
  const companyCol = headers.indexOf('Company Name');
  const contactCol = headers.indexOf('Contact Name');
  const titleCol = headers.indexOf('Title');
  const emailCol = headers.indexOf('Email');
  const websiteCol = headers.indexOf('Website');
  const linkedinCol = headers.indexOf('LinkedIn');
  const statusCol = headers.indexOf('Status');
  const notesCol = headers.indexOf('Notes');
  
  // Find real PE firms needing enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyCol] || '';
    const contact = row[contactCol] || '';
    const email = row[emailCol] || '';
    const website = row[websiteCol] || '';
    const status = (row[statusCol] || '').toLowerCase();
    
    // Skip Dead leads, Sent, or fully Enriched
    if (status.includes('dead') || status === 'sent' || status === 'enriched') {
      continue;
    }
    
    // Skip placeholder contacts
    if (contact === 'Jacob Zodikoff') {
      continue;
    }
    
    // Need enrichment if: no contact name OR no email OR generic email
    const isGeneric = email.match(/^(info@|sales@|ir@|contact@|hello@|support@)/i);
    const needsEnrich = !contact || !email || isGeneric;
    
    if (needsEnrich && company && website) {
      needsEnrichment.push({
        rowIndex: i + 1,
        company,
        contact,
        email,
        website,
        status
      });
    }
  }
  
  console.log(`\nFound ${needsEnrichment.length} real PE firms needing enrichment`);
  console.log(JSON.stringify(needsEnrichment.slice(0, 15), null, 2));
  
  return needsEnrichment;
}

main().catch(console.error);
