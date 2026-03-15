const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const RANGE = 'Contacts!A:M';

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });

  // New firms to add
  const newRows = [
    [
      'Pacific Avenue Capital Partners', // Company
      'Private Equity', // Industry
      'Callene Carstens', // Contact Name
      'Vice President, Investor Relations', // Title
      'ccarstens@pacificavenuecapital.com', // Email
      '', // LinkedIn
      'Manhattan Beach, CA', // Location
      'Middle-market PE, corporate divestitures, carve-outs', // Notes
      '$3.8B AUM, Fund II $1.65B (Aug 2025)', // Fund Info
      'Enriched', // Status
      'pacificavenuecapital.com/contact/', // Source
      new Date().toISOString().split('T')[0], // Date Added
      '' // Last Contact
    ],
    [
      'Hughes & Company', // Company
      'Private Equity', // Industry
      '', // Contact Name (generic only)
      '', // Title
      'info@hughes-co.com', // Email
      '', // LinkedIn
      'Chicago, IL', // Location
      'Healthcare software & tech-enabled services, lower middle market', // Notes
      'Fund II closed Sept 2025', // Fund Info
      'Research - Generic Email', // Status
      'hughes-co.com/contact/', // Source
      new Date().toISOString().split('T')[0], // Date Added
      '' // Last Contact
    ]
  ];

  try {
    // Append the new rows
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: RANGE,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: newRows
      }
    });

    console.log('✅ Added 2 new firms to the sheet');
    console.log(`Updated range: ${response.data.updates.updatedRange}`);
    console.log(`Rows added: ${response.data.updates.updatedRows}`);
  } catch (error) {
    console.error('❌ Error updating sheet:', error.message);
  }
}

updateSheet();
