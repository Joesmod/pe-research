const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

async function updateHighRoad() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  const values = [[
    "William C. Connell",
    "Co-founder and Managing Partner",
    "wconnell@highroadcap.com",
    "https://www.linkedin.com/company/high-road-capital-partners",
    "https://www.linkedin.com/company/high-road-capital-partners",
    "Business Services, Healthcare Services",
    "",
    "Enriched - Verified 2026-03-12",
    "",
    "New York. $470M+ AUM. VERIFIED from highroadcap.com/team: William C. Connell (Co-founder/MP, wconnell@highroadcap.com, 212-554-3267), Jeffrey M. Goodrich (Co-founder/Partner, jgoodrich@highroadcap.com, 212-554-3268), J. Christiano (Co-founder/Partner, jchristiano@highroadcap.com). BD: Matt Hadley (VP, mhadley@highroadcap.com, 212-554-3285), Susannah Solis (Coord, ssolis@highroadcap.com, 212-554-3278). Verified 2026-03-12 from official sources."
  ]];
  
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!C991:L991',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values },
  });
  
  console.log('Updated High Road Capital Partners row 991 with verified contacts');
}

updateHighRoad().catch(console.error);
