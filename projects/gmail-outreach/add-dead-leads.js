const {google} = require('googleapis');
const auth = new google.auth.GoogleAuth({keyFile: 'service-account.json', scopes: ['https://www.googleapis.com/auth/spreadsheets']});

async function run() {
  const sheets = google.sheets({version: 'v4', auth: await auth.getClient()});
  const id = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Check headers
  const header = await sheets.spreadsheets.values.get({spreadsheetId: id, range: 'Sheet1!A1:Z1'});
  console.log('Headers:', JSON.stringify(header.data.values[0]));
  
  // Get current row count
  const data = await sheets.spreadsheets.values.get({spreadsheetId: id, range: 'Sheet1!A:A'});
  const nextRow = data.data.values.length + 1;
  console.log('Next row:', nextRow);
  
  // Headers are typically: Company, Website/Domain, Sector Focus, Portfolio Companies, HQ, AUM, Gumbo Score, Notes, Status, Last Contacted
  // Let me check and adapt
  const headers = header.data.values[0];
  console.log('Column count:', headers.length);
  
  // Build rows based on headers - need to map correctly
  // Common layout: A=Company, B=Domain, ..., I=Status, J=Last Contacted, + Notes somewhere
  const leads = [
    {company: 'Muse', status: 'Dead', notes: 'Multiple meetings, proposal out, they countered lowball, we passed'},
    {company: 'Backstroke', status: 'Dead', notes: 'Steve had 1st call + proposal (~$70K/mo). Didn\'t pan out. Contact later'},
    {company: 'Satso', status: 'Dead', notes: 'Pro-sobriety SaaS needs CTO/dev. Steve followed up, didn\'t pan out. Contact later'},
  ];
  
  // Find column indices
  const colIdx = {};
  headers.forEach((h, i) => {
    const lower = h.toLowerCase().trim();
    if (lower.includes('company') || lower === 'name') colIdx.company = i;
    if (lower.includes('status')) colIdx.status = i;
    if (lower.includes('notes')) colIdx.notes = i;
  });
  console.log('Column indices:', JSON.stringify(colIdx));
  
  const rows = leads.map(lead => {
    const row = new Array(headers.length).fill('');
    if (colIdx.company !== undefined) row[colIdx.company] = lead.company;
    if (colIdx.status !== undefined) row[colIdx.status] = lead.status;
    if (colIdx.notes !== undefined) row[colIdx.notes] = lead.notes;
    return row;
  });
  
  await sheets.spreadsheets.values.append({
    spreadsheetId: id,
    range: 'Sheet1!A:A',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: rows }
  });
  
  console.log('Added 3 rows starting at row', nextRow);
  
  // Now grey them out - get sheet ID first
  const meta = await sheets.spreadsheets.get({spreadsheetId: id, fields: 'sheets.properties'});
  const sheetId = meta.data.sheets.find(s => s.properties.title === 'Sheet1').properties.sheetId;
  
  // Apply grey background to the 3 new rows
  const updatedData = await sheets.spreadsheets.values.get({spreadsheetId: id, range: 'Sheet1!A:A'});
  const totalRows = updatedData.data.values.length;
  const startRow = totalRows - 3; // 0-indexed for format request
  
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: id,
    requestBody: {
      requests: [{
        repeatCell: {
          range: {sheetId, startRowIndex: startRow, endRowIndex: totalRows, startColumnIndex: 0, endColumnIndex: headers.length},
          cell: {
            userEnteredFormat: {
              backgroundColor: {red: 0.85, green: 0.85, blue: 0.85},
              textFormat: {foregroundColor: {red: 0.6, green: 0.6, blue: 0.6}}
            }
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat.foregroundColor)'
        }
      }]
    }
  });
  
  console.log('Greyed out rows', startRow + 1, 'to', totalRows);
  console.log('DONE');
}

run().catch(e => console.error(e));
