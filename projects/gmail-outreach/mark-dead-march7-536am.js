const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const deadLeads = [
  { row: 802, company: 'Thrive Capital', reason: 'Dead - VC Firm' },
  { row: 803, company: 'TimesSquare Capital Management, LLC', reason: 'Dead - Asset Manager' },
  { row: 804, company: 'Trian Fund Management, L.P.', reason: 'Dead - Hedge Fund' }
];

async function markDead() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  for (const lead of deadLeads) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Sheet1!J${lead.row}`,
      valueInputOption: 'RAW',
      resource: { values: [[lead.reason]] }
    });
    
    console.log(`✓ Marked ${lead.company} as: ${lead.reason}`);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n✓ Marked ${deadLeads.length} firms as Dead`);
}

markDead().catch(console.error);
