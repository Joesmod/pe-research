const fs = require('fs');
const { google } = require('googleapis');

const SERVICE_ACCOUNT = JSON.parse(fs.readFileSync('./service-account.json', 'utf8'));
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const enrichmentResults = [
  {
    row: 974, // Row number in sheet (1-indexed)
    firm: "Bow River Capital",
    contact: "Greg J. Hiatrides",
    email: "hiatrides@bowrivercapital.com",
    title: "Managing Director",
    linkedin: "http://www.linkedin.com/in/gregory-hiatrides-a1684a32"
  },
  {
    row: 975,
    firm: "Amulet Capital Partners",
    contact: "Avi Uttamchandani",
    email: "auttamchandani@amuletcapital.com",
    title: "Partner",
    linkedin: "http://www.linkedin.com/in/avi-uttamchandani-79b89512"
  },
  {
    row: 976,
    firm: "Trivest Partners",
    contact: "Reid Callaway",
    email: "rcallaway@trivest.com",
    title: "Managing Director",
    linkedin: "http://www.linkedin.com/in/reid-callaway-45920018"
  }
];

async function updateSheet() {
  const auth = new google.auth.JWT({
    email: SERVICE_ACCOUNT.client_email,
    key: SERVICE_ACCOUNT.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const sheets = google.sheets({ version: 'v4', auth });

  console.log('📝 Updating Google Sheet with enrichment results...\n');

  const updates = [];
  
  for (const result of enrichmentResults) {
    const rowNum = result.row;
    
    // Columns: C=Contact, D=Title, E=Email, G=LinkedIn, J=Status
    // Note: A1 notation is 1-indexed
    updates.push({
      range: `Sheet1!C${rowNum}`,
      values: [[result.contact]]
    });
    updates.push({
      range: `Sheet1!D${rowNum}`,
      values: [[result.title]]
    });
    updates.push({
      range: `Sheet1!E${rowNum}`,
      values: [[result.email]]
    });
    updates.push({
      range: `Sheet1!G${rowNum}`,
      values: [[result.linkedin]]
    });
    updates.push({
      range: `Sheet1!J${rowNum}`,
      values: [['Enriched']]
    });
    
    console.log(`✅ Prepared update for row ${rowNum}: ${result.contact} - ${result.email}`);
  }

  // Batch update all cells
  const batchUpdateRequest = {
    spreadsheetId: SHEET_ID,
    resource: {
      valueInputOption: 'USER_ENTERED',
      data: updates
    }
  };

  try {
    const response = await sheets.spreadsheets.values.batchUpdate(batchUpdateRequest);
    console.log(`\n✅ Successfully updated ${response.data.totalUpdatedCells} cells in the sheet!`);
    console.log(`   Updated ${enrichmentResults.length} leads with verified emails.`);
  } catch (error) {
    console.error('❌ Error updating sheet:', error.message);
    throw error;
  }
}

updateSheet().catch(console.error);
