const { google } = require('googleapis');

// New firms to add to the sheet
const newFirms = [
  {
    company: 'Gemspring Capital',
    website: 'https://www.gemspring.com',
    sectorFocus: 'Business Services, Healthcare, Value-Added Distribution',
    notes: '$3.5B AUM, Lower-middle market'
  },
  {
    company: 'Gryphon Investors',
    website: 'https://www.gryphon-inv.com',
    sectorFocus: 'Business Services, Healthcare, Industrials',
    notes: '$10B+ AUM, Mid-market $50M-$500M investments'
  },
  {
    company: 'Sterling Investment Partners',
    website: 'https://www.sterlinglp.com',
    sectorFocus: 'Distribution, Business Services',
    notes: 'Mid-market, $75-250M investments'
  },
  {
    company: 'Blue Point Capital Partners',
    website: 'https://www.bluepointcapital.com',
    sectorFocus: 'Industrial, Business Services, Consumer',
    notes: 'Lower-middle market'
  }
];

async function addFirms() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // First, find the last row with data
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:A'
  });
  
  const rows = response.data.values || [];
  const lastRow = rows.length;
  const startRow = lastRow + 1;
  
  console.log(`Adding ${newFirms.length} new firms starting at row ${startRow}...\n`);
  
  // Prepare data for batch append
  const values = newFirms.map(firm => [
    firm.company,         // Company Name (A)
    '',                   // NotebookLM (B)
    '',                   // Contact Name (C)
    '',                   // Title (D)
    '',                   // Email (E)
    firm.website,         // Website (F)
    '',                   // LinkedIn (G)
    firm.sectorFocus,     // Sector Focus (H)
    '',                   // Portfolio Companies (I)
    'New',                // Status (J)
    '',                   // Last Contacted (K)
    firm.notes            // Notes (L)
  ]);
  
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Sheet1!A:L',
    valueInputOption: 'RAW',
    resource: { values }
  });
  
  console.log('✓ Added new firms to sheet!\n');
  
  // Return the row numbers for enrichment
  const addedRows = [];
  for (let i = 0; i < newFirms.length; i++) {
    addedRows.push({
      company: newFirms[i].company,
      rowIndex: startRow + i
    });
    console.log(`Row ${startRow + i}: ${newFirms[i].company}`);
  }
  
  return addedRows;
}

addFirms().then(rows => {
  console.log('\nNew firms added. Row numbers:', JSON.stringify(rows, null, 2));
}).catch(console.error);
