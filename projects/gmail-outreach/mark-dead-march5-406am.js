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

// Non-PE service providers to mark as dead
const DEAD_FIRMS = [
  { name: 'Cardea Group', reason: 'Executive recruiting firm (not PE)' },
  { name: 'Jensen Partners', reason: 'Executive search firm (not PE)' },
  { name: 'Kinect Capital', reason: 'Nonprofit accelerator (not PE)' },
  { name: 'Wall Street Oasis', reason: 'Financial careers website (not PE)' },
  { name: 'Wall Street Prep', reason: 'Training company (not PE)' },
  { name: 'Wefunder', reason: 'Crowdfunding platform (not PE)' },
  { name: 'Loeb.nyc', reason: 'Unclear/not verifiable PE firm' },
  { name: 'Odyssey Search Partners', reason: 'Executive search (not PE)' },
  { name: 'TAP Advisors', reason: 'Advisory firm (not PE)' }
];

async function main() {
  console.log('=== Marking Non-PE Firms as Dead ===\n');
  
  // Read sheet
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:J'
  });
  
  const rows = res.data.values;
  const headers = rows[0];
  const companyIdx = headers.indexOf('Company Name');
  const statusIdx = headers.findIndex(h => h.includes('Status')) || 9;
  
  const updates = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !row[companyIdx]) continue;
    
    const company = row[companyIdx].trim();
    const deadFirm = DEAD_FIRMS.find(f => company === f.name);
    
    if (deadFirm) {
      console.log(`Row ${i + 1}: ${company}`);
      console.log(`  Marking as: Dead - ${deadFirm.reason}\n`);
      
      updates.push({
        range: `Sheet1!J${i + 1}`,
        values: [[`Dead - ${deadFirm.reason}`]]
      });
    }
  }
  
  console.log(`\n=== Updating ${updates.length} rows ===\n`);
  
  for (const update of updates) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: update.range,
      valueInputOption: 'RAW',
      resource: { values: update.values }
    });
    
    const rowNum = update.range.match(/\d+/)[0];
    console.log(`✓ Updated row ${rowNum}`);
  }
  
  console.log(`\n✓ Done! Marked ${updates.length} non-PE firms as dead`);
}

main().catch(console.error);
