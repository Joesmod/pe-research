const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read the sheet
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:Z1000'
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
  const titleIdx = headers.indexOf('Title');
  
  console.log(`Found columns: Company=${companyIdx}, Contact=${contactIdx}, Email=${emailIdx}, Status=${statusIdx}, Title=${titleIdx}`);
  
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    const title = row[titleIdx] || '';
    
    // Skip if status is Sent, Dead (including Dead - ...), or Enriched
    if (status === 'Sent' || status === 'Enriched' || status.startsWith('Dead')) continue;
    
    // Skip if company is empty
    if (!company) continue;
    
    // Need enrichment if: no contact name OR email is generic/empty
    const isGeneric = /^(info@|sales@|ir@|contact@|support@)/i.test(email);
    const needsContact = !contact || contact.trim() === '';
    const needsEmail = !email || email.trim() === '' || isGeneric;
    
    if (needsContact || needsEmail) {
      needsEnrichment.push({
        row: i + 1,
        company,
        contact,
        email,
        title,
        status,
        needsContact,
        needsEmail
      });
    }
  }
  
  console.log(`\n=== PE ENRICHMENT NEEDS (${needsEnrichment.length} total) ===\n`);
  
  // Show first 15
  const toShow = needsEnrichment.slice(0, 15);
  toShow.forEach(lead => {
    console.log(`Row ${lead.row}: ${lead.company}`);
    console.log(`  Contact: ${lead.contact || '(empty)'}`);
    console.log(`  Email: ${lead.email || '(empty)'}`);
    console.log(`  Title: ${lead.title || '(empty)'}`);
    console.log(`  Status: ${lead.status || '(empty)'}`);
    console.log(`  Needs: ${lead.needsContact ? 'Contact' : ''} ${lead.needsEmail ? 'Email' : ''}`);
    console.log('');
  });
  
  // Save to file for reference
  fs.writeFileSync('enrich-targets-march7-536am.json', JSON.stringify(toShow, null, 2));
  console.log(`\nSaved ${toShow.length} targets to enrich-targets-march7-536am.json`);
}

main().catch(console.error);
