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
  
  const companyIdx = headers.indexOf('Company');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const statusIdx = headers.indexOf('Status');
  
  console.log('Total rows (including header):', rows.length);
  
  const needsEnrichment = rows.slice(1).filter((row, idx) => {
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    
    // Skip if Status is Dead/Sent/Replied
    if (['Dead', 'Sent', 'Replied', 'Scheduled'].includes(status)) return false;
    
    // Needs enrichment if: no contact name OR generic/empty email
    const noContact = !contact || contact.trim() === '';
    const badEmail = !email || email.trim() === '' || 
                     email.includes('info@') || 
                     email.includes('sales@') || 
                     email.includes('ir@') ||
                     email.includes('contact@');
    
    return noContact || badEmail;
  });
  
  console.log('\nLeads needing enrichment:', needsEnrichment.length);
  console.log('\nFirst 15 that need enrichment:');
  needsEnrichment.slice(0, 15).forEach((row, idx) => {
    console.log(`\n${idx + 1}. ${row[companyIdx]}`);
    console.log(`   Contact: ${row[contactIdx] || '(empty)'}`);
    console.log(`   Email: ${row[emailIdx] || '(empty)'}`);
    console.log(`   Status: ${row[statusIdx] || '(empty)'}`);
  });
}

readSheet().catch(console.error);
