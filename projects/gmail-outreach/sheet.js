const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function getAuth() {
  return new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

async function readSheet() {
  const auth = await getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:N', // Extended to include more columns
  });
  
  const rows = response.data.values || [];
  if (rows.length === 0) {
    console.log('No data found');
    return { headers: [], data: [] };
  }
  
  const headers = rows[0];
  const data = rows.slice(1).map((row, idx) => ({
    rowIndex: idx + 2, // Sheet row number (1-indexed + header)
    values: row,
    raw: row,
  }));
  
  return { headers, data, rows };
}

async function updateRow(rowIndex, values) {
  const auth = await getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `Sheet1!A${rowIndex}:N${rowIndex}`,
    valueInputOption: 'RAW',
    resource: { values: [values] },
  });
}

async function appendRow(values) {
  const auth = await getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:N',
    valueInputOption: 'RAW',
    resource: { values: [values] },
  });
}

async function main() {
  const command = process.argv[2];
  
  if (command === 'read') {
    const { headers, data } = await readSheet();
    console.log('Headers:', headers.join(' | '));
    console.log(`\nTotal rows: ${data.length}`);
    
    // Find rows needing enrichment
    const headerIdx = {
      company: headers.findIndex(h => h && h.toLowerCase().includes('company')),
      contact: headers.findIndex(h => h && h.toLowerCase().includes('contact')),
      email: headers.findIndex(h => h && h.toLowerCase().includes('email')),
      status: headers.findIndex(h => h && h.toLowerCase().includes('status')),
    };
    
    const needsEnrichment = data.filter(row => {
      const contact = (row.values[headerIdx.contact] || '').trim();
      const email = (row.values[headerIdx.email] || '').trim();
      const status = (row.values[headerIdx.status] || '').toLowerCase();
      
      // Check if row needs enrichment
      const hasNoContact = !contact || contact === '';
      const hasGenericEmail = email && (email.startsWith('info@') || email.startsWith('sales@') || email.startsWith('ir@'));
      const isActive = status !== 'dead' && status !== 'enriched' && status !== 'sent';
      
      return isActive && (hasNoContact || hasGenericEmail);
    });
    
    console.log(`\nRows needing enrichment: ${needsEnrichment.length}`);
    console.log('\nFirst 10 rows needing enrichment:');
    
    needsEnrichment.slice(0, 10).forEach(row => {
      const company = row.values[headerIdx.company] || '';
      const contact = row.values[headerIdx.contact] || '(empty)';
      const email = row.values[headerIdx.email] || '(empty)';
      console.log(`Row ${row.rowIndex}: ${company} | ${contact} | ${email}`);
    });
    
  } else if (command === 'update' && process.argv[3] && process.argv[4]) {
    const rowIndex = parseInt(process.argv[3]);
    const valueJson = process.argv.slice(4).join(' ');
    const values = JSON.parse(valueJson);
    await updateRow(rowIndex, values);
    console.log(`Updated row ${rowIndex}`);
  } else {
    console.log('Usage:');
    console.log('  node sheet.js read');
    console.log('  node sheet.js update <rowIndex> <jsonArray>');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { readSheet, updateRow, appendRow };
