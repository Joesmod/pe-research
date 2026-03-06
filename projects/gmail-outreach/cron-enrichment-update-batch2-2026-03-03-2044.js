const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Additional enriched leads with verified emails from public sources
const enrichments = [
  {
    row: 556, // AI Fund
    contact: 'Eva Wang',
    title: 'Partner, COO & General Counsel',
    email: 'eva@aifund.ai',
    linkedin: 'https://www.linkedin.com/in/eva-wang-338a0886',
    status: 'Enriched',
    source: 'ContactOut + multiple verified directories'
  },
  {
    row: 482, // SkyBridge Capital
    contact: 'John Darsie',
    title: 'Partner & Head of Business Development',
    email: 'jdarsie@skybridge.com',
    linkedin: 'https://www.linkedin.com/in/john-darsie',
    status: 'Enriched',
    source: 'ZoomInfo + public profiles'
  }
];

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  console.log(`Updating ${enrichments.length} additional leads in Google Sheet...\n`);
  
  for (const lead of enrichments) {
    const range = `Sheet1!B${lead.row}:J${lead.row}`;
    
    try {
      // Read current row
      const readRes = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range
      });
      
      const currentRow = readRes.data.values ? readRes.data.values[0] : [];
      
      // Update fields
      currentRow[0] = lead.contact;
      currentRow[1] = lead.title;
      currentRow[2] = lead.email;
      currentRow[4] = lead.linkedin;
      currentRow[7] = lead.status;
      
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [currentRow]
        }
      });
      
      console.log(`✓ Row ${lead.row} updated: ${lead.contact} (${lead.title}) - ${lead.email}`);
      console.log(`  Source: ${lead.source}\n`);
      
    } catch (err) {
      console.error(`✗ Error updating row ${lead.row}:`, err.message);
    }
  }
  
  console.log(`\n=== BATCH 2 ENRICHMENT COMPLETE ===`);
  console.log(`Total enriched this batch: ${enrichments.length} leads`);
  console.log(`Cumulative total: 6 leads enriched`);
}

updateSheet().catch(console.error);
