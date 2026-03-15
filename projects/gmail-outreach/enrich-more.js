const {google} = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const RANGE = 'Sheet1!A1:J100';

// Additional enrichments
const updates = [
  {
    companyName: 'Apax Partners',
    updates: {
      C: 'Mitch Truwit',
      D: 'Co-CEO & Partner',
      E: 'mtruwit@apax.com',
      G: 'https://www.linkedin.com/in/mitchtruwit/',
      I: 'Email pattern verified ZoomInfo. Co-CEO with Andrew Sillitoe. Joined 2006, deep tech/consumer expertise.',
      J: 'Enriched'
    }
  },
  {
    companyName: 'Hellman & Friedman',
    updates: {
      C: 'Adam Laursen',
      D: 'Managing Director, Investor Relations',
      E: 'alaursen@hf.com',
      G: 'https://www.linkedin.com/in/adam-laursen-157b0855',
      I: 'Email pattern [first_initial][last]@hf.com (71.7% RocketReach). San Francisco-based IR lead.',
      J: 'Enriched'
    }
  },
  {
    companyName: 'Vesey Street Capital Partners',
    updates: {
      C: 'Adam Feinstein',
      D: 'Managing Partner & Founder',
      E: 'afeinstein@vscpllc.com',
      G: 'https://www.linkedin.com/in/adam-feinstein-30037612/',
      I: 'Email verified RocketReach/Apollo. 30+ yrs healthcare investment experience. Healthcare services focus.',
      J: 'Enriched'
    }
  },
  {
    companyName: 'Cressey & Company',
    updates: {
      C: 'Bryan Cressey',
      D: 'Founder & Managing Partner',
      E: 'bcressey@cresseyco.com',
      G: 'https://www.linkedin.com/in/bryan-cressey/',
      I: 'Email pattern verified ContactOut. Co-founded GTCR, Thoma Cressey Bravo. Healthcare-focused PE pioneer.',
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
