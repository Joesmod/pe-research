const {google} = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const RANGE = 'Sheet1!A:K';

async function getSheets() {
  const key = JSON.parse(fs.readFileSync('service-account.json'));
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  return google.sheets({version: 'v4', auth});
}

async function readSheet() {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: RANGE
  });
  return res.data.values || [];
}

async function updateRow(rowIndex, updates) {
  // updates is object like {C: "John Doe", D: "CEO", E: "jdoe@firm.com"}
  const sheets = await getSheets();
  const requests = Object.keys(updates).map(col => ({
    range: `Sheet1!${col}${rowIndex}`,
    values: [[updates[col]]]
  }));
  
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    resource: {
      valueInputOption: 'RAW',
      data: requests
    }
  });
}

async function findNeedsEnrichment(limit = 15) {
  const rows = await readSheet();
  const needsWork = [];
  
  for (let i = 1; i < rows.length && needsWork.length < limit; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const website = row[1] || '';
    const contactName = row[2] || '';
    const email = row[4] || '';
    const status = row[9] || '';
    
    // Skip completely empty rows
    if (!company || company.trim() === '') {
      continue;
    }
    
    // Skip if already enriched or dead
    if (status.toLowerCase().includes('enriched') || status.toLowerCase().includes('dead')) {
      continue;
    }
    
    // Check if needs enrichment
    const needsContact = !contactName || contactName.trim() === '';
    const needsEmail = !email || email.trim() === '' || 
                       email.includes('info@') || 
                       email.includes('sales@') || 
                       email.includes('ir@') ||
                       email.includes('contact@') ||
                       email.includes('email_not_unlocked@');
    
    if (needsContact || needsEmail) {
      needsWork.push({
        rowIndex: i + 1,
        company,
        website,
        contactName,
        email,
        status,
        reason: needsContact ? 'Missing contact' : 'Generic/missing email'
      });
    }
  }
  
  return needsWork;
}

module.exports = {readSheet, updateRow, findNeedsEnrichment};

// CLI usage
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'find') {
    findNeedsEnrichment(15).then(leads => {
      console.log(JSON.stringify(leads, null, 2));
    });
  } else if (command === 'update') {
    const rowIndex = parseInt(process.argv[3]);
    const col = process.argv[4];
    const value = process.argv[5];
    updateRow(rowIndex, {[col]: value}).then(() => {
      console.log(`Updated row ${rowIndex} ${col}="${value}"`);
    });
  }
}
