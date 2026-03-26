const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

async function getClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

// Column mapping (0-indexed)
const COL = {
  COMPANY: 0,      // A
  WEBSITE: 1,      // B
  CONTACT: 2,      // C
  TITLE: 3,        // D
  EMAIL: 4,        // E
  WEBSITE2: 5,     // F (sometimes duplicate)
  LINKEDIN: 6,     // G
  STATUS: 7,       // H
  NOTES: 8,        // I
};

function columnToLetter(col) {
  let letter = '';
  let c = col;
  while (c >= 0) {
    letter = String.fromCharCode((c % 26) + 65) + letter;
    c = Math.floor(c / 26) - 1;
  }
  return letter;
}

async function enrichLeads(enrichments) {
  const sheets = await getClient();
  
  // Read all company names
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:I',
  });
  const rows = res.data.values || [];
  
  if (rows.length === 0) {
    console.log('No data found');
    return;
  }
  
  console.log(`Loaded ${rows.length} rows from spreadsheet`);
  
  const updates = [];
  
  for (const enrichment of enrichments) {
    // Find row for this company
    const rowIndex = rows.findIndex(row => 
      row[COL.COMPANY] && row[COL.COMPANY].toLowerCase().trim() === enrichment.company.toLowerCase().trim()
    );
    
    if (rowIndex === -1) {
      console.log(`❌ Company not found: ${enrichment.company}`);
      continue;
    }
    
    const rowNum = rowIndex + 1; // 1-based row number for sheets
    const row = rows[rowIndex];
    
    console.log(`\n📝 Enriching row ${rowNum}: ${enrichment.company}`);
    
    // Prepare updates for each field
    if (enrichment.contactName) {
      updates.push({ 
        range: `Sheet1!${columnToLetter(COL.CONTACT)}${rowNum}`, 
        values: [[enrichment.contactName]] 
      });
      console.log(`  → Contact: ${enrichment.contactName}`);
    }
    
    if (enrichment.title) {
      updates.push({ 
        range: `Sheet1!${columnToLetter(COL.TITLE)}${rowNum}`, 
        values: [[enrichment.title]] 
      });
      console.log(`  → Title: ${enrichment.title}`);
    }
    
    if (enrichment.email) {
      updates.push({ 
        range: `Sheet1!${columnToLetter(COL.EMAIL)}${rowNum}`, 
        values: [[enrichment.email]] 
      });
      console.log(`  → Email: ${enrichment.email}`);
    }
    
    if (enrichment.linkedIn) {
      updates.push({ 
        range: `Sheet1!${columnToLetter(COL.LINKEDIN)}${rowNum}`, 
        values: [[enrichment.linkedIn]] 
      });
      console.log(`  → LinkedIn: ${enrichment.linkedIn}`);
    }
    
    if (enrichment.status) {
      updates.push({ 
        range: `Sheet1!${columnToLetter(COL.STATUS)}${rowNum}`, 
        values: [[enrichment.status]] 
      });
      console.log(`  → Status: ${enrichment.status}`);
    }
    
    if (enrichment.notes) {
      const existingNotes = row[COL.NOTES] || '';
      const newNotes = existingNotes 
        ? `${existingNotes}; ${enrichment.notes} (${new Date().toISOString().split('T')[0]})`
        : `${enrichment.notes} (${new Date().toISOString().split('T')[0]})`;
      updates.push({ 
        range: `Sheet1!${columnToLetter(COL.NOTES)}${rowNum}`, 
        values: [[newNotes]] 
      });
      console.log(`  → Notes: ${enrichment.notes}`);
    }
  }
  
  // Execute batch update
  if (updates.length > 0) {
    console.log(`\n🔄 Executing batch update of ${updates.length} cells...`);
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: updates,
      },
    });
    console.log(`✅ Successfully updated ${updates.length} cells`);
  } else {
    console.log('\n⚠️ No updates to perform');
  }
}

// Read enrichments
const input = process.argv[2];
if (!input) {
  console.log('Usage: node enrich-v2.js <enrichments.json or JSON string>');
  process.exit(1);
}

let enrichments;
try {
  if (input.startsWith('[')) {
    enrichments = JSON.parse(input);
  } else {
    enrichments = require(path.resolve(input));
  }
} catch (e) {
  console.error('Error reading enrichments:', e.message);
  process.exit(1);
}

enrichLeads(enrichments).catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
