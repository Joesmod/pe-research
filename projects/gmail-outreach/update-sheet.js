const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Updates to make (row number, column D for Title)
  const updates = [
    {
      row: 5,
      company: 'Regal Healthcare Capital Partners',
      title: 'Co-Founder & General Partner',
      source: 'Verified on regalhcp.com/about and Bloomberg'
    },
    {
      row: 10,
      company: 'Alvarez & Marsal Capital',
      title: 'Managing Partner & Founder',
      source: 'Verified on a-mcapital.com team page'
    },
    {
      row: 12,
      company: 'Casa Verde Capital',
      title: 'Managing Partner',
      source: 'Verified on casaverdecapital.com/team'
    },
    {
      row: 224,
      company: 'Pine Brook Partners',
      title: 'Chairman & CEO / Co-Founder',
      source: 'Verified on PR Newswire and Energy Council'
    },
    {
      row: 235,
      company: 'AEA Investors',
      title: 'Chief Executive Officer & Partner',
      source: 'Verified on aeainvestors.com team page'
    }
  ];
  
  console.log('Updating sheet with verified titles...\n');
  
  for (const update of updates) {
    const range = `Sheet1!D${update.row}`;
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: range,
      valueInputOption: 'RAW',
      resource: {
        values: [[update.title]]
      }
    });
    
    console.log(`✓ Row ${update.row}: ${update.company}`);
    console.log(`  Title: ${update.title}`);
    console.log(`  Source: ${update.source}\n`);
  }
  
  console.log('Sheet updated successfully!');
}

updateSheet().catch(console.error);
