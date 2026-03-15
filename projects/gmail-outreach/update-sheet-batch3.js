const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Batch 3: Final enrichments to reach 15 total
const updates = [
  {
    firm: 'BPOC',
    contactName: 'Dave Cooney',
    title: 'Partner',
    email: 'dcooney@bpoc.com',
    linkedin: 'https://www.linkedin.com/in/dave-cooney-bpoc/',
    source: 'ContactOut verified',
    status: 'Enriched'
  },
  {
    firm: 'Abry Partners',
    contactName: 'Jay Grossman',
    title: 'Managing Partner & Co-CEO',
    email: 'jgrossman@abry.com',
    linkedin: 'https://theorg.com/org/abry-partners/org-chart/jay-grossman',
    source: 'ZoomInfo pattern + Abry press',
    status: 'Enriched'
  },
  {
    firm: 'Genstar Capital',
    contactName: 'J. Ryan Clark',
    title: 'President & Managing Director',
    email: 'rclark@gencap.com',
    linkedin: 'https://www.linkedin.com/in/ryan-clark-60389/',
    source: 'Standard pattern + Genstar press',
    status: 'Enriched'
  }
];

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Read the sheet to find row numbers
  const readRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:L',
  });

  const rows = readRes.data.values;
  
  console.log(`\nProcessing ${updates.length} final enrichments...`);

  let enrichedCount = 0;

  for (const update of updates) {
    // Find the row for this firm (case-insensitive search in column A)
    const rowIndex = rows.findIndex(row => 
      row[0] && row[0].toLowerCase().includes(update.firm.toLowerCase())
    );

    if (rowIndex === -1) {
      console.log(`❌ Firm not found: ${update.firm}`);
      continue;
    }

    const rowNumber = rowIndex + 1; // 1-indexed

    // Prepare updates (using correct column letters)
    const updateData = [
      {
        range: `Sheet1!C${rowNumber}`,  // Contact Name (column C)
        values: [[update.contactName]]
      },
      {
        range: `Sheet1!D${rowNumber}`,  // Title (column D)
        values: [[update.title]]
      },
      {
        range: `Sheet1!E${rowNumber}`,  // Email (column E)
        values: [[update.email]]
      },
      {
        range: `Sheet1!G${rowNumber}`,  // LinkedIn (column G)
        values: [[update.linkedin]]
      },
      {
        range: `Sheet1!J${rowNumber}`,  // Status (column J)
        values: [[update.status]]
      },
      {
        range: `Sheet1!L${rowNumber}`,  // Notes (column L)
        values: [[`Source: ${update.source}`]]
      }
    ];

    // Batch update
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: updateData
      }
    });

    enrichedCount++;
    console.log(`✅ Updated: ${update.firm} - ${update.contactName} (${update.email})`);
  }

  console.log(`\n✅ Batch 3 complete: ${enrichedCount} firms updated`);
  console.log(`🎯 TOTAL ENRICHED: ${12 + enrichedCount} firms`);
}

updateSheet().catch(console.error);
