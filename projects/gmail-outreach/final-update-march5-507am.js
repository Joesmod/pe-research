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

const enrichments = [
  {
    company: "Alta Park Capital, LP",
    updates: {
      status: "Dead - Hedge Fund",
      notes: "Public equity hedge fund focused on TMT sector. Invests in public securities, not PE. Based in San Francisco."
    }
  },
  {
    company: "Ancor Capital Partners",
    updates: {
      contactName: "Brook Smith",
      title: "Partner & Managing Director",
      linkedin: "https://www.linkedin.com/in/brook-smith-a935508",
      status: "Partial",
      notes: "Middle-market PE. Healthcare, industrial, consumer. No verified direct email found (only info@ancorcapital.com). Source: ancorcapital.com (2026-03-05)"
    }
  }
];

async function updateSheet() {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:J'
    });
    
    const rows = res.data.values;
    
    for (const enrich of enrichments) {
      const rowIndex = rows.findIndex(row => row[0] === enrich.company);
      if (rowIndex === -1) {
        console.log(`Could not find: ${enrich.company}`);
        continue;
      }
      
      const rowNum = rowIndex + 1;
      const updates = enrich.updates;
      const batchData = [];
      
      if (updates.contactName) {
        batchData.push({ range: `Sheet1!C${rowNum}`, values: [[updates.contactName]] });
      }
      if (updates.title) {
        batchData.push({ range: `Sheet1!D${rowNum}`, values: [[updates.title]] });
      }
      if (updates.linkedin) {
        batchData.push({ range: `Sheet1!G${rowNum}`, values: [[updates.linkedin]] });
      }
      if (updates.notes) {
        batchData.push({ range: `Sheet1!I${rowNum}`, values: [[updates.notes]] });
      }
      if (updates.status) {
        batchData.push({ range: `Sheet1!J${rowNum}`, values: [[updates.status]] });
      }
      
      if (batchData.length > 0) {
        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: SHEET_ID,
          resource: { valueInputOption: 'RAW', data: batchData }
        });
        console.log(`✓ ${enrich.company} (Row ${rowNum})`);
      }
    }
    
    console.log('\n=== FINAL CRON RUN SUMMARY (March 5, 5:06 AM) ===');
    console.log('Total firms researched: 12');
    console.log('✓ Fully enriched (verified emails): 2');
    console.log('  - Arctaris Impact Investors: jonathan@arctaris.com');
    console.log('  - Argentum Capital Partners: draynor@argentumgroup.com');
    console.log('\n⊘ Partial enrichments (name/title, no email): 3');
    console.log('  - 3G Capital: Alex Behring (extremely private)');
    console.log('  - Atlantic Street Capital: Peter Shabecoff');
    console.log('  - Ancor Capital Partners: Brook Smith');
    console.log('\n✗ Dead leads identified: 7');
    console.log('  - Keltic: Acquired by Ares 2014');
    console.log('  - Jett Capital: Investment bank');
    console.log('  - Apercen: Tax consulting firm');
    console.log('  - ArrowMark: Asset manager ($900M AUM)');
    console.log('  - RCP Advisors: Fund-of-funds ($18.7B)');
    console.log('  - Victory Capital: Public asset manager (VCTR)');
    console.log('  - Alta Park: Hedge fund (TMT public equity)');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

updateSheet();
