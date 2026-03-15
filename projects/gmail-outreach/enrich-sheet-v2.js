const {google} = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const RANGE = 'Sheet1!A1:J100';

// Corrections and enrichments to apply (search by company name)
const updates = [
  {
    companyName: 'LLR Partners',
    updates: {
      C: 'Jim Murphy',
      D: 'Senior Managing Director, Value Creation',
      E: 'jmurphy@llrpartners.com',
      G: 'https://www.linkedin.com/in/jim-murphy-llr',
      I: 'Email pattern [first_initial][last]@llrpartners.com (100% RocketReach). LLR team page verified. CFO expertise.',
      J: 'Enriched'
    }
  },
  {
    companyName: 'Compass Group Equity Partners',
    updates: {
      C: 'John Huhn',
      D: 'Founder & Managing Partner',
      E: 'johnh@cgep.com',
      G: 'https://www.linkedin.com/in/john-huhn/',
      I: 'Email verified ContactOut. 35+ yrs PE, 75+ transactions, $3B+ enterprise value. St. Louis-based.',
      J: 'Enriched'
    }
  },
  {
    companyName: 'TA Associates',
    updates: {
      C: 'Ajit Nedungadi',
      D: 'CEO & Co-Managing Partner',
      E: 'anedungadi@ta.com',
      G: 'https://www.linkedin.com/in/ajit-nedungadi-48b8b710',
      I: 'Email pattern [first_initial][last]@ta.com (88.8% RocketReach). CEO since 2021, joined TA 1999. Global PE leader.',
      J: 'Enriched'
    }
  },
  {
    companyName: 'Summit Partners',
    updates: {
      C: 'Peter Chung',
      D: 'CEO & Managing Director',
      E: 'pchung@summitpartners.com',
      G: 'https://www.summitpartners.com/team/peter-chung',
      I: 'Email pattern [first_initial][last]@summitpartners.com (92% LeadIQ). CEO since 2015, joined 1994. $46B AUM.',
      J: 'Enriched'
    }
  }
];

async function updateSheet() {
  try {
    const key = JSON.parse(fs.readFileSync('service-account.json'));
    const auth = new google.auth.GoogleAuth({
      credentials: key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    const sheets = google.sheets({version: 'v4', auth: await auth.getClient()});
    
    // Read current data
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE
    });
    
    const rows = res.data.values;
    console.log(`Loaded ${rows.length} rows from sheet\n`);
    
    // Apply updates by finding company name
    let updatedCount = 0;
    for (const update of updates) {
      const rowIndex = rows.findIndex(row => 
        row[0] && row[0].trim().toLowerCase() === update.companyName.toLowerCase()
      );
      
      if (rowIndex === -1) {
        console.log(`⚠️  Company not found: ${update.companyName}`);
        continue;
      }
      
      const row = rows[rowIndex];
      console.log(`✅ Updating row ${rowIndex + 1}: ${update.companyName}`);
      
      // Apply column updates (A=0, B=1, C=2, etc.)
      if (update.updates.C !== undefined) row[2] = update.updates.C;
      if (update.updates.D !== undefined) row[3] = update.updates.D;
      if (update.updates.E !== undefined) row[4] = update.updates.E;
      if (update.updates.F !== undefined) row[5] = update.updates.F;
      if (update.updates.G !== undefined) row[6] = update.updates.G;
      if (update.updates.H !== undefined) row[7] = update.updates.H;
      if (update.updates.I !== undefined) row[8] = update.updates.I;
      if (update.updates.J !== undefined) row[9] = update.updates.J;
      
      console.log(`   Name: ${row[2]} | Title: ${row[3]}`);
      console.log(`   Email: ${row[4]}\n`);
      updatedCount++;
    }
    
    // Write back to sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: RANGE,
      valueInputOption: 'RAW',
      resource: {
        values: rows
      }
    });
    
    console.log(`\n✅ Successfully updated ${updatedCount} companies in the sheet`);
    
  } catch (error) {
    console.error('Error updating sheet:', error.message);
    throw error;
  }
}

updateSheet();
