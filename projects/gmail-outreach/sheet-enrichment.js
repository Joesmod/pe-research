const {google} = require('googleapis');
const key = require('./service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function getSheet() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({version: 'v4', auth});
  return sheets;
}

async function readLeads() {
  const sheets = await getSheet();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:L'
  });
  return res.data.values;
}

async function updateRow(rowIndex, updates) {
  const sheets = await getSheet();
  // updates is an object like {contactName: "John Doe", title: "CEO", email: "jdoe@example.com"}
  const row = rowIndex + 1; // 1-indexed
  
  const requests = [];
  const colMap = {
    contactName: 'C',
    title: 'D',
    email: 'E',
    linkedinContact: 'G',
    notes: 'I',
    status: 'J',
    lastUpdated: 'K',
    additionalNotes: 'L'
  };
  
  for (const [field, value] of Object.entries(updates)) {
    if (colMap[field]) {
      requests.push({
        range: `Sheet1!${colMap[field]}${row}`,
        values: [[value]]
      });
    }
  }
  
  if (requests.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      resource: {
        valueInputOption: 'RAW',
        data: requests
      }
    });
  }
}

module.exports = {readLeads, updateRow};
