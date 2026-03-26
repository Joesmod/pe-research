const { google } = require('googleapis');
const auth = new google.auth.GoogleAuth({
  keyFile: 'gmail-outreach/service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

(async () => {
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  const id = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

  const rows = [
    ['Muse', '', '', '', '', '', '', '', 'Dead', '', 'Multiple meetings, proposal out, countered low-ball, we passed. From Jeff tracker.'],
    ['Backstroke', '', '', '', '', '', '', '', 'Stalled', '', 'Steve had 1st call + proposal out. Did not pan out. Contact later. From Jeff tracker.'],
    ['Satso', '', '', '', '', '', '', '', 'Stalled', '', 'Pro-sobriety SaaS, needs CTO/dev team. Steve followed up, did not pan out. Contact later. From Jeff tracker.']
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: id,
    range: 'Sheet1!A:K',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: rows }
  });
  console.log('Added 3 rows');

  const meta = await sheets.spreadsheets.values.get({ spreadsheetId: id, range: 'Sheet1!A:A' });
  const totalRows = (meta.data.values || []).length;
  console.log('Total rows:', totalRows);

  const sheetMeta = await sheets.spreadsheets.get({ spreadsheetId: id, fields: 'sheets(properties(sheetId,title))' });
  const sheetId = sheetMeta.data.sheets.find(s => s.properties.title === 'Sheet1').properties.sheetId;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: id,
    requestBody: {
      requests: [{
        repeatCell: {
          range: { sheetId, startRowIndex: totalRows - 3, endRowIndex: totalRows, startColumnIndex: 0, endColumnIndex: 15 },
          cell: { userEnteredFormat: { backgroundColor: { red: 0.85, green: 0.85, blue: 0.85 } } },
          fields: 'userEnteredFormat.backgroundColor'
        }
      }]
    }
  });
  console.log('Greyed out last 3 rows');
})();
