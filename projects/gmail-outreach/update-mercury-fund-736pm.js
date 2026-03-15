const { google } = require('googleapis');
const key = require('./service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function updateMercuryFund() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const sheets = google.sheets({ version: 'v4', auth });

  console.log('Updating Mercury Fund with Blair Garrou contact info...\n');

  // The enrichment data
  const update = {
    company: 'Mercury Fund',
    contactName: 'Blair Garrou',
    title: 'Co-Founder, Managing Partner',
    email: 'blair@mercuryfund.com',
    linkedIn: 'https://www.linkedin.com/in/bgarrou/',
    status: 'Enriched',
    notes: 'Houston-based early-stage VC. Also Adjunct Professor at Rice University. Email verified via ContactOut. Source: mercuryfund.com/team + ContactOut (2026-03-06)'
  };

  // First, find the row index for Mercury Fund
  const readResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:K'
  });

  const rows = readResponse.data.values;
  let rowIndex = -1;

  for (let i = 1; i < rows.length; i++) {  // Start at 1 to skip header
    if (rows[i][0] === 'Mercury Fund') {
      rowIndex = i + 1;  // +1 for 1-indexed sheet rows
      break;
    }
  }

  if (rowIndex === -1) {
    console.log('❌ Mercury Fund not found in sheet');
    return;
  }

  console.log(`✓ Found Mercury Fund at row ${rowIndex}`);

  // Update the row
  // Columns: A=Company, B=NotebookLM, C=Contact, D=Title, E=Email, F=Website, G=LinkedIn, H=Sector, I=Portfolio, J=Status, K=Last Contacted
  const updates = [
    {
      range: `Sheet1!C${rowIndex}`,  // Contact Name
      values: [[update.contactName]]
    },
    {
      range: `Sheet1!D${rowIndex}`,  // Title
      values: [[update.title]]
    },
    {
      range: `Sheet1!E${rowIndex}`,  // Email
      values: [[update.email]]
    },
    {
      range: `Sheet1!G${rowIndex}`,  // LinkedIn
      values: [[update.linkedIn]]
    },
    {
      range: `Sheet1!J${rowIndex}`,  // Status
      values: [[update.status]]
    },
    {
      range: `Sheet1!I${rowIndex}`,  // Notes (Portfolio Companies column)
      values: [[update.notes]]
    }
  ];

  // Batch update
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      data: updates,
      valueInputOption: 'USER_ENTERED'
    }
  });

  console.log('\n✅ Mercury Fund updated successfully!');
  console.log(`   Contact: ${update.contactName}`);
  console.log(`   Title: ${update.title}`);
  console.log(`   Email: ${update.email}`);
  console.log(`   Status: ${update.status}`);
}

updateMercuryFund()
  .then(() => {
    console.log('\n✓ Update complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Update failed:', error.message);
    process.exit(1);
  });
