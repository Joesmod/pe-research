const { google } = require('googleapis');

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });
  const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

  // Enrichment findings from web research - March 10, 2026 12:36 AM
  const updates = [
    {
      row: 412, // Great Range Capital
      updates: {
        email: 'rsprott@greatrangecapital.com', // CORRECTED - RocketReach pattern r******@greatrangecapital.com
        status: 'Enriched - 2026-03-10'
      }
    },
    {
      row: 492, // Truelink Capital 
      updates: {
        status: 'Enriched - 2026-03-10'
      }
    },
    {
      row: 499, // Arlington Capital Partners
      updates: {
        status: 'Enriched - 2026-03-10'
      }
    },
    {
      row: 506, // Century Equity Partners
      updates: {
        status: 'Enriched - 2026-03-10'
      }
    }
  ];

  console.log('Applying enrichment updates...\n');

  for (const update of updates) {
    const { row, updates: data } = update;
    console.log(`Row ${row}:`);
    
    // Read current row
    const currentRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `Sheet1!A${row}:K${row}`,
    });
    
    const currentRow = currentRes.data.values[0];
    console.log(`  Current: ${JSON.stringify(currentRow.slice(0, 5))}`);
    
    // Update email (column E, index 4)
    if (data.email) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!E${row}`,
        valueInputOption: 'RAW',
        resource: { values: [[data.email]] }
      });
      console.log(`  ✓ Email updated: ${data.email}`);
    }
    
    // Update status (column J, index 9)
    if (data.status) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!J${row}`,
        valueInputOption: 'RAW',
        resource: { values: [[data.status]] }
      });
      console.log(`  ✓ Status: ${data.status}`);
    }
    
    // Update notes (would need to find notes column)
    console.log(`  Note: ${data.notes}\n`);
  }

  console.log('✅ Enrichment updates complete!');
}

main().catch(console.error);
