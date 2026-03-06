const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const credentials = JSON.parse(fs.readFileSync('service-account.json', 'utf8'));

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

async function addNewFirms() {
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  
  // Get current data to find the next empty row
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:K'
  });
  
  const rows = response.data.values;
  const nextRow = rows.length + 1;
  
  // New firms to add
  const newFirms = [
    {
      company: 'NaviMed Capital',
      website: 'https://navimed.com/',
      contactName: 'Ryan Schwarz',
      title: 'Managing Director',
      email: 'ryan.schwarz@navimed.com',
      linkedin: 'https://www.linkedin.com/pub/ryan-schwarz/40/85a/528',
      phone: '',
      industry: 'Healthcare Services',
      notes: 'Washington DC-based healthcare-only PE. MD with 30yrs experience, ex-Carlyle. Also: Bijan Salehizadeh MD (bijan@navimed.com), Brian Canann MD-Portfolio Ops (brian.canann@navimed.com), Ryan Ross MD (ryan.ross@navimed.com). All emails verified from official website.',
      status: 'Enriched'
    }
  ];
  
  // Prepare the values to append
  const values = newFirms.map(firm => [
    firm.company,
    firm.website,
    firm.contactName,
    firm.title,
    firm.email,
    firm.linkedin,
    firm.phone,
    firm.industry,
    firm.notes,
    firm.status,
    '' // Empty column K
  ]);
  
  // Append the new rows
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:K',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    resource: {
      values: values
    }
  });
  
  console.log(`✅ Added ${newFirms.length} new firm(s) starting at row ${nextRow}`);
  newFirms.forEach((firm, index) => {
    console.log(`  ${index + 1}. ${firm.company} - ${firm.contactName} (${firm.title})`);
  });
}

addNewFirms().catch(console.error);
