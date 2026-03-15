const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const updates = [
  {
    row: 535,
    company: 'RA Capital Management',
    contact: {
      name: 'Joshua Resnick',
      title: 'Partner and Senior Managing Director',
      email: 'jresnick@racap.com',
      linkedin: 'http://www.linkedin.com/in/joshuaresnick'
    }
  },
  {
    row: 851,
    company: 'Wynnchurch Capital',
    contact: {
      name: 'Alexis Underwood',
      title: 'Managing Director/Operating Partner',
      email: 'aunderwood@wynnchurch.com',
      linkedin: 'http://www.linkedin.com/in/alexisunderwood'
    }
  }
];

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  console.log('Waiting 60 seconds for rate limit reset...');
  await new Promise(r => setTimeout(r, 60000));
  
  for (const update of updates) {
    try {
      console.log(`\nUpdating row ${update.row}: ${update.company}`);
      
      // Update Contact Name (column C)
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!C${update.row}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[update.contact.name]]
        }
      });
      
      await new Promise(r => setTimeout(r, 3000));
      
      // Update Title (column D)
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!D${update.row}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[update.contact.title]]
        }
      });
      
      await new Promise(r => setTimeout(r, 3000));
      
      // Update Email (column E)
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!E${update.row}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[update.contact.email]]
        }
      });
      
      await new Promise(r => setTimeout(r, 3000));
      
      // Update LinkedIn (column G)
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!G${update.row}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[update.contact.linkedin]]
        }
      });
      
      await new Promise(r => setTimeout(r, 3000));
      
      // Update Status (column J)
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!J${update.row}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [['Enriched']]
        }
      });
      
      await new Promise(r => setTimeout(r, 3000));
      
      // Update Notes (column L)
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!L${update.row}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[`Apollo enriched ${new Date().toISOString().split('T')[0]}: Apollo API`]]
        }
      });
      
      console.log(`✓ Updated row ${update.row}`);
      
      await new Promise(r => setTimeout(r, 5000));
    } catch (error) {
      console.error(`Error updating row ${update.row}:`, error.message);
    }
  }
  
  console.log('\n✅ All updates complete!');
}

updateSheet().catch(console.error);
