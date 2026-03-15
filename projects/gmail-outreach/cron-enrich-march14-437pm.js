const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

async function main() {
  console.log('=== PE Research & Enrichment - March 14, 4:37 PM ===\n');
  
  // Auth
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read the sheet
  console.log('Reading Google Sheet...');
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:M',
  });
  
  const rows = res.data.values || [];
  if (rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  // Headers
  const headers = rows[0];
  console.log('Headers:', headers);
  console.log(`Total rows: ${rows.length - 1}\n`);
  
  // Find columns
  const companyIdx = headers.indexOf('Company');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const titleIdx = headers.indexOf('Position/Title');
  const statusIdx = headers.indexOf('Status');
  const linkedinIdx = headers.indexOf('LinkedIn URL');
  const notesIdx = headers.indexOf('Notes');
  
  // Identify leads needing enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const title = row[titleIdx] || '';
    const status = row[statusIdx] || '';
    const linkedin = row[linkedinIdx] || '';
    
    // Skip if status is Dead, Duplicate, Sent, Replied
    if (['Dead', 'Duplicate', 'Sent', 'Replied', 'Bounced'].includes(status)) {
      continue;
    }
    
    // Check if needs enrichment
    const hasNoContact = !contact || contact.trim() === '';
    const hasGenericEmail = email && (
      email.toLowerCase().startsWith('info@') ||
      email.toLowerCase().startsWith('sales@') ||
      email.toLowerCase().startsWith('ir@') ||
      email.toLowerCase().startsWith('contact@')
    );
    const hasNoEmail = !email || email.trim() === '';
    
    if (hasNoContact || hasGenericEmail || hasNoEmail) {
      needsEnrichment.push({
        rowNum: i + 1,
        company,
        contact,
        email,
        title,
        status,
        linkedin,
        issue: hasNoContact ? 'No Contact' : (hasNoEmail ? 'No Email' : 'Generic Email')
      });
    }
  }
  
  console.log(`\nLeads needing enrichment: ${needsEnrichment.length}`);
  console.log('\n=== Top 15 for Enrichment ===\n');
  
  const top15 = needsEnrichment.slice(0, 15);
  top15.forEach((lead, idx) => {
    console.log(`${idx + 1}. Row ${lead.rowNum}: ${lead.company}`);
    console.log(`   Issue: ${lead.issue}`);
    console.log(`   Contact: ${lead.contact || '[EMPTY]'}`);
    console.log(`   Email: ${lead.email || '[EMPTY]'}`);
    console.log(`   Status: ${lead.status}`);
    console.log('');
  });
  
  // Save full list to file
  fs.writeFileSync(
    path.join(__dirname, 'enrichment-targets-march14-437pm.json'),
    JSON.stringify(top15, null, 2)
  );
  
  console.log(`\nSaved top 15 targets to enrichment-targets-march14-437pm.json`);
  console.log('\nNext: Manual research to find decision-makers with verified emails.\n');
}

main().catch(console.error);
