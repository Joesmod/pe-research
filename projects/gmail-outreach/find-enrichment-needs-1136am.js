const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = JSON.parse(fs.readFileSync('service-account.json'));

async function readSheet() {
  const auth = new google.auth.JWT(
    SERVICE_ACCOUNT.client_email,
    null,
    SERVICE_ACCOUNT.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
  );

  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:M500',
  });

  const rows = response.data.values || [];
  const headers = rows[0];
  
  const companyIdx = headers.indexOf('Company Name');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const statusIdx = headers.indexOf('Status');
  const websiteIdx = headers.indexOf('Website');
  
  const needsEnrichment = [];
  
  rows.slice(1).forEach((row, idx) => {
    const rowNum = idx + 2; // +2 because: +1 for 0-index, +1 for header
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    const website = row[websiteIdx] || '';
    
    // Skip if Dead/DUPLICATE/Contacted/Replied
    if (status.includes('Dead') || 
        status.includes('DUPLICATE') || 
        status.includes('Contacted') || 
        status.includes('Replied')) {
      return;
    }
    
    // Check for bad data
    const noContact = !contact || contact.trim() === '';
    const badEmail = !email || 
                     email.trim() === '' ||
                     email.includes('info@') || 
                     email.includes('sales@') || 
                     email.includes('ir@') ||
                     email.includes('contact@') ||
                     email.includes('@domain.') ||
                     // Email field contains a title instead of email
                     !email.includes('@') ||
                     email.toLowerCase().includes('partner') ||
                     email.toLowerCase().includes('founder') ||
                     email.toLowerCase().includes('ceo') ||
                     email.toLowerCase().includes('president');
    
    if (noContact || badEmail) {
      needsEnrichment.push({
        rowNum,
        company,
        contact,
        email,
        status,
        website,
        reason: noContact ? 'No contact' : 'Bad email'
      });
    }
  });
  
  console.log(`\n📊 ENRICHMENT STATUS:`);
  console.log(`Total rows: ${rows.length - 1}`);
  console.log(`Needs enrichment: ${needsEnrichment.length}`);
  
  console.log(`\n=== TOP 15 LEADS NEEDING ENRICHMENT ===\n`);
  needsEnrichment.slice(0, 15).forEach((item, idx) => {
    console.log(`${idx + 1}. [Row ${item.rowNum}] ${item.company}`);
    console.log(`   Contact: ${item.contact || '(empty)'}`);
    console.log(`   Email: ${item.email || '(empty)'}`);
    console.log(`   Status: ${item.status}`);
    console.log(`   Website: ${item.website || '(empty)'}`);
    console.log(`   Reason: ${item.reason}`);
    console.log('');
  });
  
  // Save to JSON for processing
  fs.writeFileSync(
    'enrichment-targets-march7-1136am.json',
    JSON.stringify(needsEnrichment.slice(0, 15), null, 2)
  );
  console.log(`\n✅ Saved top 15 targets to enrichment-targets-march7-1136am.json`);
}

readSheet().catch(console.error);
