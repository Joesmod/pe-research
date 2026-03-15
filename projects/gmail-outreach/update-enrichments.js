const { google } = require('googleapis');
const key = require('./service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  const updates = [];
  
  // 1. Graycliff Partners LP (Row 612) - Update Status to Enriched, add LinkedIn
  updates.push({
    range: 'J612', // Status column
    values: [['Enriched - Verified 2026-03-15']]
  });
  updates.push({
    range: 'F612', // LinkedIn column (assuming F)
    values: [['https://www.linkedin.com/in/stephen-hindmarch-7978b611/']]
  });
  updates.push({
    range: 'K612', // Notes column
    values: [['Email verified from ContactOut. Managing Director at Seattle-based PE firm.']]
  });
  
  // 2. Renovus Capital - Row 988 - Fix Atif Gilani's email
  updates.push({
    range: 'E988', // Email column
    values: [['agilani@renovuscapital.com']]
  });
  updates.push({
    range: 'K988', // Notes column
    values: [['Founding Partner. Email verified from ZoomInfo 2026-03-15. $2B+ AUM, Knowledge & Talent sectors.']]
  });
  updates.push({
    range: 'F988', // LinkedIn
    values: [['https://www.linkedin.com/in/atif-gilani/']]
  });
  
  // 3. F6S (Row 605) - Mark as Dead - Not PE Firm
  updates.push({
    range: 'J605', // Status
    values: [['Dead - Not PE Firm']]
  });
  updates.push({
    range: 'K605', // Notes
    values: [['Startup platform/community connecting founders with investors. Not an investment firm.']]
  });
  
  // 4. Capstone Partners (Row 723) - Mark as Dead - Not PE Firm
  updates.push({
    range: 'J723', // Status  
    values: [['Dead - Not PE Firm']]
  });
  updates.push({
    range: 'K723', // Notes
    values: [['Investment banking / M&A advisory firm. Advises PE firms but does not invest.']]
  });
  
  console.log(`Updating ${updates.length} cells...`);
  
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    resource: {
      valueInputOption: 'RAW',
      data: updates
    }
  });
  
  console.log('✅ Sheet updated successfully!');
  console.log('\nUpdates made:');
  console.log('- Graycliff Partners LP (Row 612): Status → Enriched, added LinkedIn & notes');
  console.log('- Renovus Capital Partners (Row 988): Fixed Atif Gilani email → agilani@renovuscapital.com');
  console.log('- F6S (Row 605): Marked as Dead - Not PE Firm');
  console.log('- Capstone Partners (Row 723): Marked as Dead - Not PE Firm');
}

updateSheet().catch(console.error);
