const { google } = require('googleapis');
const fs = require('fs');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function readSheet() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: SCOPES,
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // Read the sheet data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:Z', // Read all columns
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found.');
      return;
    }

    const headers = rows[0];
    console.log('Headers:', headers);
    console.log(`\nTotal rows: ${rows.length - 1}`);
    
    // Find rows needing enrichment
    const contactNameIdx = headers.indexOf('Contact Name');
    const emailIdx = headers.indexOf('Email');
    const statusIdx = headers.indexOf('Status');
    const companyIdx = headers.indexOf('Company');
    
    const needsEnrichment = [];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const contactName = row[contactNameIdx] || '';
      const email = row[emailIdx] || '';
      const status = row[statusIdx] || '';
      const company = row[companyIdx] || '';
      
      // Check if needs enrichment: empty contact name OR generic email
      const hasEmptyContact = !contactName || contactName.trim() === '';
      const hasGenericEmail = !email || 
        email.toLowerCase().includes('info@') || 
        email.toLowerCase().includes('sales@') ||
        email.toLowerCase().includes('ir@') ||
        email.toLowerCase().includes('contact@');
      
      if ((hasEmptyContact || hasGenericEmail) && status !== 'Dead') {
        needsEnrichment.push({
          row: i + 1,
          company,
          contactName,
          email,
          status
        });
      }
    }
    
    console.log(`\nRows needing enrichment: ${needsEnrichment.length}`);
    console.log('\nFirst 15 that need enrichment:');
    needsEnrichment.slice(0, 15).forEach(item => {
      console.log(`Row ${item.row}: ${item.company} | ${item.contactName || '(empty)'} | ${item.email || '(empty)'} | ${item.status}`);
    });
    
    return { headers, rows, needsEnrichment };
  } catch (error) {
    console.error('Error reading sheet:', error.message);
    throw error;
  }
}

readSheet().catch(console.error);
