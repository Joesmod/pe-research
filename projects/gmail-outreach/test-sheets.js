const {google} = require('googleapis');
const creds = require('./sheets-service-account.json');

(async () => {
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({version: 'v4', auth: await auth.getClient()});
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '1oiuiGHWyg01RKnFVk5FPcHI10y7VBWrAE1MaTAiM-sw',
    range: 'Sheet1!A1:G10'
  });
  console.log('Sheet data:', JSON.stringify(res.data.values || 'empty', null, 2));
})().catch(e => console.error('Error:', e.message));
