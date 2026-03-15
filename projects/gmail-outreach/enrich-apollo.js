const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Apollo-verified contacts
const updates = [
  {
    firm: 'Sentinel Capital Partners',
    contactName: 'Jim Coady',
    title: 'Partner',
    email: 'coady@sentinelpartners.com',
    linkedin: 'http://www.linkedin.com/in/jim-coady-111737324',
    source: 'Apollo verified',
    status: 'Enriched'
  },
  {
    firm: 'Banneker Partners',
    contactName: 'Matthew McDonald',
    title: 'Partner',
    email: 'mmcdonald@bannekerpartners.com',
    linkedin: 'http://www.linkedin.com/in/mimcdonald',
    source: 'Apollo verified',
    status: 'Enriched'
  },
  {
    firm: 'Harkness Capital Partners',
    contactName: 'Ian Handsman',
    title: 'Partner',
    email: 'ihandsman@harknesscapital.com',
    linkedin: 'http://www.linkedin.com/in/ian-handsman-0181b311',
    source: 'Apollo verified',
    status: 'Enriched'
  },
  {
    firm: 'RoundTable Healthcare Partners',
    contactName: 'Tim Connors',
    title: 'Managing Partner',
    email: 'tconnors@roundtablehp.com',
    linkedin: 'http://www.linkedin.com/in/tim-connors-4168335',
    source: 'Apollo verified',
    status: 'Enriched'
  },
  {
    firm: 'Ronin Equity Partners',
    contactName: 'Jesse Yao',
    title: 'Managing Partner',
    email: 'jesse.yao@roninequitypartners.com',
    linkedin: 'http://www.linkedin.com/in/jesse-yao-7a3ba614',
    source: 'Apollo verified',
    status: 'Enriched'
  },
  {
    firm: 'Avante Capital Partners',
    contactName: 'Ivelisse Simon',
    title: 'Managing Partner',
    email: 'ivelisse@avantecap.com',
    linkedin: 'http://www.linkedin.com/in/ivelisse-rodriguez-simon-93905b23',
    source: 'Apollo verified',
    status: 'Enriched'
  },
  {
    firm: 'Mountaingate Capital',
    contactName: 'Bennett Thompson',
    title: 'Co-Founder, Managing Director',
    email: 'bthompson@mountaingate.com',
    linkedin: 'http://www.linkedin.com/in/bennett-thompson-b780358',
    source: 'Apollo verified',
    status: 'Enriched'
  },
  {
    firm: 'Station Partners',
    contactName: 'Ryan Kelly',
    title: 'Managing Partner',
    email: 'ryan@stationpartners.com',
    linkedin: 'http://www.linkedin.com/in/j-ryan-kelly-4b9ab13',
    source: 'Apollo verified',
    status: 'Enriched'
  },
  {
    firm: 'Argonaut Private Equity',
    contactName: 'Steve Mitchell',
    title: 'CEO',
    email: 'steve@argonautpe.com',
    linkedin: 'http://www.linkedin.com/in/steve-mitchell-831b1050',
    source: 'Apollo verified',
    status: 'Enriched'
  },
  {
    firm: 'Harvest Partners (SCF)',
    contactName: 'Jay Hegenbart',
    title: 'Senior Managing Director',
    email: 'jh@harvestpartners.com',
    linkedin: 'N/A',
    source: 'Business Wire press release',
    status: 'Enriched'
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
