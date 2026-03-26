const {google} = require('googleapis');
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'projects/gmail-outreach/service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({version: 'v4', auth: await auth.getClient()});

  // Get Contacts sheet
  const contacts = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID, range: 'Contacts!A1:I500'
  });
  const cRows = contacts.data.values || [];
  console.log('Total contacts:', cRows.length - 1);

  // Build contacts by company (only those with real emails)
  const contactsByCompany = {};
  for (let i = 1; i < cRows.length; i++) {
    const co = cRows[i][0];
    const email = cRows[i][4] || '';
    if (email && !/^(info@|sales@|ir@|contact@)/i.test(email)) {
      if (!contactsByCompany[co]) contactsByCompany[co] = [];
      contactsByCompany[co].push({
        name: cRows[i][2], title: cRows[i][3], email, 
        status: cRows[i][5], linkedin: cRows[i][6]
      });
    }
  }

  // Get Sheet1
  const sheet1 = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID, range: 'Sheet1!A1:M300'
  });
  const s1 = sheet1.data.values || [];

  // Find Sheet1 rows needing enrichment that have contacts
  const updates = [];
  for (let i = 1; i < s1.length; i++) {
    const co = s1[i][0];
    const email = s1[i][3] || '';
    const generic = /^(info@|sales@|ir@|contact@)/i.test(email);
    if ((!email || generic) && contactsByCompany[co]) {
      const best = contactsByCompany[co][0]; // take first
      console.log('Row ' + (i+1) + ': ' + co + ' -> ' + best.name + ' | ' + best.title + ' | ' + best.email);
      updates.push({row: i+1, contact: best});
    }
  }
  console.log('\nCan update ' + updates.length + ' rows from Contacts sheet');

  // Apply updates to Sheet1
  if (updates.length > 0) {
    const requests = [];
    for (const u of updates) {
      // Update B (Contact Name), C (Title), D (Email), F (LinkedIn), I (Status), K (Notes)
      const row = u.row;
      const c = u.contact;
      requests.push(sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: 'Sheet1!B' + row + ':D' + row,
        valueInputOption: 'RAW',
        requestBody: { values: [[c.name, c.title, c.email]] }
      }));
      if (c.linkedin) {
        requests.push(sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: 'Sheet1!F' + row,
          valueInputOption: 'RAW',
          requestBody: { values: [[c.linkedin]] }
        }));
      }
      requests.push(sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: 'Sheet1!I' + row,
        valueInputOption: 'RAW',
        requestBody: { values: [['Enriched']] }
      }));
      const note = 'Cross-referenced from Contacts sheet. Email: ' + c.email + ' (' + (c.status||'verified') + '). 2026-02-18 auto-enrichment.';
      requests.push(sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: 'Sheet1!K' + row,
        valueInputOption: 'RAW',
        requestBody: { values: [[note]] }
      }));
    }
    await Promise.all(requests);
    console.log('Updated ' + updates.length + ' rows in Sheet1');
  }
}

main().catch(console.error);
