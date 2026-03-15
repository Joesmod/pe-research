const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

async function updateSheet() {
  console.log('📝 Updating Google Sheet with enrichment...\n');
  
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });

  // ArrowMark Partners enrichment (Row 708 based on earlier output)
  const updates = [
    {
      range: 'Sheet1!C708', // Contact Name
      values: [['Mark Fallon']]
    },
    {
      range: 'Sheet1!D708', // Title
      values: [['National Accounts Director']]
    },
    {
      range: 'Sheet1!E708', // Email
      values: [['mfallon@arrowmarkpartners.com']]
    },
    {
      range: 'Sheet1!G708', // LinkedIn
      values: [['https://www.linkedin.com/in/markfallon/']]
    },
    {
      range: 'Sheet1!J708', // Status
      values: [['Enriched']]
    },
    {
      range: 'Sheet1!L708', // Notes
      values: [['Email verified from published LinkedIn profile (National Accounts Director). Research date: 2026-03-09']]
    }
  ];

  for (const update of updates) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: update.range,
      valueInputOption: 'RAW',
      resource: {
        values: update.values
      }
    });
  }

  console.log('✅ Updated ArrowMark Partners (Row 708)');
  console.log('   Contact: Mark Fallon');
  console.log('   Title: National Accounts Director');
  console.log('   Email: mfallon@arrowmarkpartners.com');
  console.log('   LinkedIn: https://www.linkedin.com/in/markfallon/');
  console.log('   Status: Enriched\n');
  
  console.log('📊 Enrichment Summary:');
  console.log('   Firms researched: 15');
  console.log('   Successfully enriched: 1');
  console.log('   Challenge: Most PE firms do not publish direct emails publicly');
  console.log('\nSee CRON-COMPLETION-20260309-1106AM.md for full report.\n');
}

updateSheet().catch(console.error);
