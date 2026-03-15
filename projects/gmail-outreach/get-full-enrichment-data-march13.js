const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = './service-account.json';

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Read current sheet data
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:R',
  });

  const rows = res.data.values;
  const headers = rows[0];

  // Target row numbers from previous run
  const targetRows = [11, 25, 240, 561, 909, 910, 1010, 1058, 1061];

  console.log('FULL DATA FOR ENRICHMENT TARGETS:\n');

  const enrichmentData = [];

  targetRows.forEach(rowNum => {
    const row = rows[rowNum - 1]; // -1 because array is 0-indexed
    if (!row) return;

    const data = {
      rowNum,
      company: row[0] || '',
      notebookLM: row[1] || '',
      contact: row[2] || '',
      title: row[3] || '',
      email: row[4] || '',
      website: row[5] || '',
      linkedin: row[6] || '',
      sector: row[7] || '',
      portfolio: row[8] || '',
      status: row[9] || '',
      lastContacted: row[10] || '',
      notes: row[11] || '',
      infoUrl: row[12] || '',
      gumboScore: row[13] || ''
    };

    enrichmentData.push(data);

    console.log(`\n===== ROW ${rowNum}: ${data.company} =====`);
    console.log(`Contact: ${data.contact}`);
    console.log(`Title: ${data.title}`);
    console.log(`Email: ${data.email}`);
    console.log(`Website: ${data.website}`);
    console.log(`LinkedIn: ${data.linkedin}`);
    console.log(`Status: ${data.status}`);
    console.log(`Notes: ${data.notes}`);
  });

  fs.writeFileSync(
    './enrichment-full-data-march13.json',
    JSON.stringify(enrichmentData, null, 2)
  );

  console.log('\n\n✓ Saved full enrichment data');
}

main().catch(console.error);
