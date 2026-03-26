const path = require('path');
const dir = 'C:\\Users\\aljen\\.openclaw\\workspace-jim\\projects\\gmail-outreach';
const {google} = require(path.join(dir, 'node_modules', 'googleapis'));
const {JWT} = require(path.join(dir, 'node_modules', 'google-auth-library'));
const creds = require(path.join(dir, 'service-account.json'));
const auth = new JWT({email: creds.client_email, key: creds.private_key, scopes: ['https://www.googleapis.com/auth/spreadsheets']});
const sheets = google.sheets({version:'v4', auth});
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { valueInputOption: 'RAW', data: [
      { range: 'Sheet1!K2', values: [['Chicago-based mid-market PE. JS-rendered website. Apollo credits exhausted + Brave quota hit 2026-02-19. Needs re-enrichment when credits reset.']] },
      { range: 'Sheet1!K118', values: [['LA-based lower mid-market PE. Daniel Colon Jr identified but no verified email. Website JS-rendered. Apollo+Brave exhausted 2026-02-19.']] },
    ]}
  });
  console.log('Notes updated for rows 2 and 118');
}
main().catch(e => console.error(e.message));
