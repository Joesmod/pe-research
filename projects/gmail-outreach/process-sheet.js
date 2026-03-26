const {google} = require('googleapis');
const key = require('./service-account.json');

async function getSheetData() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({version: 'v4', auth});
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A:L'
  });
  
  const rows = result.data.values || [];
  const needsEnrichment = [];
  
  rows.slice(1).forEach((row, idx) => {
    const firmName = row[0] || '';
    const website = row[1] || '';
    const contactName = row[2] || '';
    const email = row[4] || '';
    const status = row[9] || '';
    
    const isGenericEmail = email.match(/^(info@|sales@|ir@|contact@)/i);
    const needsWork = (!contactName || !email || isGenericEmail) && !status.match(/Dead|Enriched/i);
    
    if (needsWork && firmName) {
      needsEnrichment.push({
        rowIndex: idx + 2,
        firm: firmName,
        website: website,
        currentContact: contactName,
        currentEmail: email,
        status: status
      });
    }
  });
  
  console.log(JSON.stringify(needsEnrichment.slice(0, 15), null, 2));
}

getSheetData();
