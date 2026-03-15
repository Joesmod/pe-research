const {google} = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const RANGE = 'Sheet1!A1:J100';

// Final batch of enrichments
const updates = [
  {
    companyName: 'Francisco Partners',
    updates: {
      C: 'Dipanjan Deb',
      D: 'CEO & Co-Founder',
      E: 'ddeb@franciscopartners.com',
      G: 'https://www.linkedin.com/in/dipanjan-deb-a4844a52',
      I: 'Email verified RocketReach. Co-founded Francisco Partners. $50B+ raised since inception. Tech-focused PE.',
      J: 'Enriched'
    }
  },
  {
    companyName: 'TPG',
    updates: {
      C: 'Jon Winkelried',
      D: 'CEO & Partner',
      E: 'jwinkelried@tpg.com',
      G: 'https://www.linkedin.com/in/jon-winkelried',
      I: 'Email pattern [first_initial][last]@tpg.com (80% RocketReach). CEO since 2021. Former Goldman Sachs Co-President.',
      J: 'Enriched'
    }
  },
  {
    companyName: 'The Riverside Company',
    updates: {
      C: 'George Cole',
      D: 'Managing Partner',
      E: 'gcole@riversidecompany.com',
      G: 'https://www.linkedin.com/in/george-cole-0016265/',
      I: 'Email pattern [first_initial][last]@riversidecompany.com (94.9% RocketReach). Leads Strategic Capital Fund.',
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
