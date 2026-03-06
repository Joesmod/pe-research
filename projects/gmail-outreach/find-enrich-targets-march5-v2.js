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
    const status = (row[statusCol] || '').toLowerCase().trim();
    
    // Skip completely Dead leads or Sent
    if (status.includes('dead') || status === 'sent') {
      continue;
    }
    
    // Skip placeholder contacts
    if (contact === 'Jacob Zodikoff') {
      continue;
    }
    
    // Priority 1: Empty email
    // Priority 2: Generic email (info@, sales@, etc)
    // Priority 3: No contact name
    const hasNoEmail = !email || email.trim() === '';
    const isGeneric = email.match(/^(info@|sales@|ir@|contact@|hello@|support@|admin@|team@)/i);
    const hasNoContact = !contact || contact.trim() === '';
    
    const needsEnrich = hasNoEmail || isGeneric || hasNoContact;
    
    if (needsEnrich && company) {
      let priority = 3;
      if (hasNoEmail) priority = 1;
      else if (isGeneric) priority = 2;
      
      needsEnrichment.push({
        priority,
        rowIndex: i + 1,
        company,
        contact,
        email,
        website,
        status
      });
    }
  }
  
  // Sort by priority
  needsEnrichment.sort((a, b) => a.priority - b.priority);
  
  console.log(`\nFound ${needsEnrichment.length} firms needing enrichment`);
  console.log('\nTop 15 priority targets:');
  console.log(JSON.stringify(needsEnrichment.slice(0, 15), null, 2));
  
  return needsEnrichment;
}

main().catch(console.error);
