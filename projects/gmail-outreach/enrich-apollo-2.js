const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Second batch of enrichments
const updates = [
  {
    firm: 'Bertram Capital',
    contactName: 'Tom Beerle',
    title: 'Partner',
    email: 'tbeerle@bcap.com',
    linkedin: 'http://www.linkedin.com/in/tom-beerle-2052983',
    source: 'Apollo verified',
    status: 'Enriched'
  },
  {
    firm: 'WindPoint Partners',
    contactName: 'Kathy Rybicki',
    title: 'CIO Technology Advisor - Value Creation Team',
    email: 'krybicki@wppartners.com',
    linkedin: 'http://www.linkedin.com/in/kathyrybicki',
    source: 'Apollo verified',
    status: 'Enriched'
  },
  {
    firm: 'Thomas H. Lee Partners',
    contactName: 'Investor Relations',
    title: 'General Contact',
    email: 'info@thl.com',
    linkedin: 'N/A',
    source: 'Company website - no individual contacts found',
    status: 'Generic Contact Only'
  },
  {
    firm: 'Hg Capital',
    contactName: 'General Inquiry',
    title: 'General Contact',
    email: 'info@hgcapital.com',
    linkedin: 'N/A',
    source: 'Company website - no individual contacts found',
    status: 'Generic Contact Only'
  }
];

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // First, read the sheet to find row numbers
  const readRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:L',
  });

  const rows = readRes.data.values;
  
  // Column mappings (0-indexed)
  const colIndices = {
    company: 0,     // A: Company Name
    notebookLM: 1,  // B: NotebookLM
    contact: 2,     // C: Contact Name
    title: 3,       // D: Title
    email: 4,       // E: Email
    website: 5,     // F: Website
    linkedin: 6,    // G: LinkedIn
    sector: 7,      // H: Sector Focus
    portfolio: 8,   // I: Portfolio Companies
    status: 9,      // J: Status
    lastContacted: 10, // K: Last Contacted
    notes: 11       // L: Notes
  };

  console.log(`\nProcessing ${updates.length} enrichments...`);

  let enrichedCount = 0;

  for (const update of updates) {
    // Find the row for this firm (search company name column)
    const rowIndex = rows.findIndex(row => 
      row[colIndices.company] && row[colIndices.company].toLowerCase().includes(update.firm.toLowerCase())
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

  console.log(`\n✅ Enrichment complete: ${enrichedCount} firms updated`);
}

updateSheet().catch(console.error);
