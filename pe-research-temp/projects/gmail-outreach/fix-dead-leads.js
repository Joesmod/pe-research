const {google} = require('googleapis');
const auth = new google.auth.GoogleAuth({keyFile: 'service-account.json', scopes: ['https://www.googleapis.com/auth/spreadsheets']});

async function run() {
  const sheets = google.sheets({version: 'v4', auth: await auth.getClient()});
  const id = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Headers: A=Company Name, B=Contact Name, C=Title, D=Email, E=Website, F=LinkedIn, G=Sector Focus, H=Portfolio Companies, I=Status, J=Last Contacted, K=Notes, L=Company Info URL, M=Gumbo Score
  
  // Get total rows
  const data = await sheets.spreadsheets.values.get({spreadsheetId: id, range: 'Sheet1!A:A'});
  const totalRows = data.data.values.length;
  console.log('Total rows:', totalRows);
  
  // Check what's in the last 3 rows
  const last3 = await sheets.spreadsheets.values.get({spreadsheetId: id, range: `Sheet1!A${totalRows-2}:M${totalRows}`});
  console.log('Last 3 rows:', JSON.stringify(last3.data.values));
  
  // Fix: put company names in column A (index 0), clear column L where they went wrong
  const leads = [
    ['Muse', '', '', '', '', '', '', '', 'Dead', '', 'Multiple meetings, proposal out, they countered lowball, we passed', '', ''],
    ['Backstroke', '', '', '', '', '', '', '', 'Dead', '', "Steve had 1st call + proposal (~$70K/mo). Didn't pan out. Contact later", '', ''],
    ['Satso', '', '', '', '', '', '', '', 'Dead', '', "Pro-sobriety SaaS needs CTO/dev. Steve followed up, didn't pan out. Contact later", '', ''],
  ];
  
  await sheets.spreadsheets.values.update({
    spreadsheetId: id,
    range: `Sheet1!A${totalRows-2}:M${totalRows}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: leads }
  });
  
  console.log('Fixed rows', totalRows-2, 'to', totalRows);
  console.log('DONE');
}

run().catch(e => console.error(e));
