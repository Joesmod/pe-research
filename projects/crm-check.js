const path = require('path');
const dir = path.join(__dirname, 'gmail-outreach');
const {google} = require(path.join(dir, 'node_modules', 'googleapis'));
const {JWT} = require(path.join(dir, 'node_modules', 'google-auth-library'));
const creds = require(path.join(dir, 'service-account.json'));
const auth = new JWT({email: creds.client_email, key: creds.private_key, scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']});
const sheets = google.sheets({version:'v4', auth});
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:D'
  });
  const rows = res.data.values || [];
  console.log('Header:', rows[0]);
  const data = rows.slice(1);
  const total = data.length;
  const withContact = data.filter(r => r[1] && r[1].trim()).length;
  const noContact = total - withContact;
  console.log(`Total firms: ${total}`);
  console.log(`With contact: ${withContact}`);
  console.log(`Without contact (0 contacts): ${noContact}`);
}
main().catch(console.error);
