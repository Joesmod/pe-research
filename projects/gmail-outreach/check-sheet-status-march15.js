const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');

async function run() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_FILE,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:O'
    });
    
    const rows = response.data.values || [];
    console.log(`Total rows in sheet: ${rows.length}`);
    
    if (rows.length === 0) {
      console.log('Sheet is empty!');
      return;
    }
    
    const headers = rows[0];
    console.log('\nHeaders:', headers);
    
    const companyIdx = headers.indexOf('Company/Firm');
    const contactIdx = headers.indexOf('Contact Name');
    const emailIdx = headers.indexOf('Email');
    const statusIdx = headers.indexOf('Status');
    const websiteIdx = headers.indexOf('Website');
    
    console.log('\nColumn indices:');
    console.log(`  Company: ${companyIdx}`);
    console.log(`  Contact: ${contactIdx}`);
    console.log(`  Email: ${emailIdx}`);
    console.log(`  Status: ${statusIdx}`);
    console.log(`  Website: ${websiteIdx}`);
    
    // Count categories
    let total = 0;
    let hasContact = 0;
    let hasEmail = 0;
    let hasGenericEmail = 0;
    let emptyContact = 0;
    let emptyEmail = 0;
    let deadFirms = 0;
    
    const needsWork = [];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const company = row[companyIdx] || '';
      if (!company) continue;
      
      total++;
      const contact = row[contactIdx] || '';
      const email = row[emailIdx] || '';
      const status = (row[statusIdx] || '').toLowerCase();
      
      if (status.includes('dead') || status === 'closed') {
        deadFirms++;
        continue;
      }
      
      if (contact) hasContact++;
      if (email) hasEmail++;
      if (!contact) emptyContact++;
      if (!email) emptyEmail++;
      
      const isGeneric = email && (
        email.toLowerCase().includes('info@') ||
        email.toLowerCase().includes('sales@') ||
        email.toLowerCase().includes('ir@') ||
        email.toLowerCase().includes('contact@')
      );
      
      if (isGeneric) hasGenericEmail++;
      
      if (!contact || !email || isGeneric) {
        needsWork.push({
          row: i + 1,
          company,
          contact: contact || '(empty)',
          email: email || '(empty)',
          status: row[statusIdx] || ''
        });
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('SHEET STATUS SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total firms (non-empty): ${total}`);
    console.log(`Dead/Closed firms: ${deadFirms}`);
    console.log(`Active firms: ${total - deadFirms}`);
    console.log(`\nWith Contact Name: ${hasContact}`);
    console.log(`With Email: ${hasEmail}`);
    console.log(`With Generic Email (info@, sales@, etc.): ${hasGenericEmail}`);
    console.log(`\nMissing Contact Name: ${emptyContact}`);
    console.log(`Missing Email: ${emptyEmail}`);
    console.log(`\nNEED ENRICHMENT: ${needsWork.length}`);
    
    if (needsWork.length > 0) {
      console.log('\nFirms needing enrichment (first 20):');
      needsWork.slice(0, 20).forEach(item => {
        console.log(`  Row ${item.row}: ${item.company}`);
        console.log(`    Contact: ${item.contact} | Email: ${item.email}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  }
}

run();
