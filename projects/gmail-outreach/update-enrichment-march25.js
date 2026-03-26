const { google } = require('googleapis');
const path = require('path');

const SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SHEET_NAME = 'Sheet1';

async function updateRow(auth, rowNumber, updates) {
  const sheets = google.sheets({ version: 'v4', auth });
  
  const updateRequests = [];
  
  // Column E = Email (index 4)
  if (updates.email) {
    updateRequests.push({
      range: `${SHEET_NAME}!E${rowNumber}`,
      values: [[updates.email]]
    });
  }
  
  // Column D = Title (index 3)
  if (updates.title) {
    updateRequests.push({
      range: `${SHEET_NAME}!D${rowNumber}`,
      values: [[updates.title]]
    });
  }
  
  // Column G = LinkedIn (index 6)
  if (updates.linkedin) {
    updateRequests.push({
      range: `${SHEET_NAME}!G${rowNumber}`,
      values: [[updates.linkedin]]
    });
  }
  
  // Column H = Status (index 7)
  if (updates.status) {
    updateRequests.push({
      range: `${SHEET_NAME}!H${rowNumber}`,
      values: [[updates.status]]
    });
  }
  
  // Column I = Notes (index 8)
  if (updates.notes) {
    updateRequests.push({
      range: `${SHEET_NAME}!I${rowNumber}`,
      values: [[updates.notes]]
    });
  }
  
  for (const req of updateRequests) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: req.range,
      valueInputOption: 'RAW',
      requestBody: {
        values: req.values
      }
    });
  }
}

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'service-account.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const enrichments = [
    {
      row: 10,
      company: 'Alvarez & Marsal Capital',
      contact: 'Jack McCarthy',
      title: 'Partner, Managing Director',
      email: 'jack@a-mcapital.com',
      linkedin: 'http://www.linkedin.com/in/jack-mccarthy-204584a',
      status: 'Enriched',
      notes: 'Apollo API verified - 2026-03-25. Email: jack@a-mcapital.com (verified).'
    },
    {
      row: 11,
      company: 'Blue Star Innovation Partners',
      contact: 'Dan Wechsler',
      title: 'Chairman',
      email: 'dw@bluestarinnovationpartners.com',
      linkedin: 'http://www.linkedin.com/in/dan-wechsler-a94b0a221',
      status: 'Enriched',
      notes: 'Apollo API verified - 2026-03-25. Email: dw@bluestarinnovationpartners.com (verified).'
    },
    {
      row: 15,
      company: 'JLL Partners',
      contact: 'Dan Agroskin',
      title: 'Managing Partner',
      email: 'd.agroskin@jllpartners.com',
      linkedin: 'https://www.linkedin.com/in/dan-agroskin-204584a',
      status: 'Enriched',
      notes: 'Apollo API verified - 2026-03-25. Email: d.agroskin@jllpartners.com (verified). Managing Partner.'
    }
  ];

  console.log('=== UPDATING GOOGLE SHEET ===\n');

  for (const item of enrichments) {
    console.log(`Updating Row ${item.row}: ${item.company}`);
    console.log(`  Contact: ${item.contact}`);
    console.log(`  Email: ${item.email}`);
    
    await updateRow(auth, item.row, {
      email: item.email,
      title: item.title,
      linkedin: item.linkedin,
      status: item.status,
      notes: item.notes
    });
    
    console.log(`  ✓ Updated\n`);
  }

  console.log('Sheet update complete!');
}

main().catch(console.error);
