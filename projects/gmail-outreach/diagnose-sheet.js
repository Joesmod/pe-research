const { google } = require('googleapis');

async function diagnose() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Get headers
  const headers = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A1:N1'
  });
  
  console.log('=== HEADERS ===');
  headers.data.values[0].forEach((h, i) => {
    console.log(`Column ${String.fromCharCode(65 + i)}: ${h}`);
  });
  
  // Check specific rows
  const testRows = [161, 176, 220, 223, 234];
  
  for (const rowNum of testRows) {
    console.log(`\n=== ROW ${rowNum} ===`);
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `Sheet1!A${rowNum}:N${rowNum}`
    });
    
    const row = res.data.values ? res.data.values[0] : [];
    const [company, notebooklm, contact, title, email, website, linkedin, sector, portfolio, status, lastContacted, notes] = row;
    
    console.log(`Company: ${company || 'EMPTY'}`);
    console.log(`NotebookLM: ${notebooklm || 'EMPTY'}`);
    console.log(`Contact: ${contact || 'EMPTY'}`);
    console.log(`Title: ${title || 'EMPTY'}`);
    console.log(`Email: ${email || 'EMPTY'}`);
    console.log(`Website: ${website || 'EMPTY'}`);
    console.log(`LinkedIn: ${linkedin || 'EMPTY'}`);
    console.log(`Status: ${status || 'EMPTY'}`);
    console.log(`Notes: ${notes || 'EMPTY'}`);
  }
}

diagnose().catch(console.error);
