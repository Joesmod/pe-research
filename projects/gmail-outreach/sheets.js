const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

async function getClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function read(range = 'Sheet1') {
  const sheets = await getClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range,
  });
  const rows = res.data.values || [];
  if (rows.length === 0) { console.log('(empty)'); return; }
  // Print header + rows
  const header = rows[0];
  console.log(header.join(' | '));
  console.log(header.map(() => '---').join(' | '));
  for (let i = 1; i < rows.length; i++) {
    console.log(rows[i].join(' | '));
  }
}

async function append(range, values) {
  const sheets = await getClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values },
  });
  console.log(`Appended ${values.length} row(s)`);
}

async function update(range, values) {
  const sheets = await getClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values },
  });
  console.log(`Updated ${range}`);
}

async function info() {
  const sheets = await getClient();
  const res = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const sheetNames = res.data.sheets.map(s => s.properties.title);
  console.log('Sheets:', sheetNames.join(', '));
}

const cmd = process.argv[2];
if (cmd === 'read') {
  read(process.argv[3]).catch(e => { console.error(e.message); process.exit(1); });
} else if (cmd === 'append') {
  // node sheets.js append "Sheet1" '["val1","val2"]'
  const range = process.argv[3];
  const values = JSON.parse(process.argv[4]);
  append(range, Array.isArray(values[0]) ? values : [values]).catch(e => { console.error(e.message); process.exit(1); });
} else if (cmd === 'update') {
  const range = process.argv[3];
  const values = JSON.parse(process.argv[4]);
  update(range, Array.isArray(values[0]) ? values : [values]).catch(e => { console.error(e.message); process.exit(1); });
} else if (cmd === 'info') {
  info().catch(e => { console.error(e.message); process.exit(1); });
} else {
  console.log('Usage: node sheets.js <read|append|update|info> [range] [json]');
}
