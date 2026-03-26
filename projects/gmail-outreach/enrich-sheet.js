const { google } = require('googleapis');

const SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const updates = [
  // Row 10: A&M Capital - correct contact to Jack McCarthy
  {
    row: 10,
    company: 'Alvarez & Marsal Capital',
    contact: 'Jack McCarthy',
    title: 'Managing Partner & Founder',
    email: '', // No verified email from published sources
    linkedin: 'https://www.linkedin.com/company/a-m-capital',
    status: 'Enriched',
    notes: 'Jack McCarthy is Managing Partner & Founder. No direct email found from official sources. Source: a-mcapital.com team page'
  },
  // Row 11: Blue Star Innovation Partners - correct contact
  {
    row: 11,
    company: 'Blue Star Innovation Partners',
    contact: 'Dan Wechsler',
    title: 'CEO / Managing Partner',
    email: '', // No verified email from published sources
    linkedin: 'https://www.linkedin.com/in/dan-wechsler-a94b0a221/',
    status: 'Enriched',
    notes: 'Dan Wechsler joined as CEO in 2020. Rob Wechsler is Founder/Managing Partner. No direct emails found from official sources. Source: bluestarinnovationpartners.com'
  },
  // Row 15: JLL Partners - correct contact
  {
    row: 15,
    company: 'JLL Partners',
    contact: 'Dan Agroskin',
    title: 'Managing Partner',
    email: '', // No verified email from published sources
    linkedin: 'https://www.linkedin.com/company/jll-partners',
    status: 'Enriched',
    notes: 'Dan Agroskin is Managing Partner (leads healthcare vertical). Other MPs: Kevin Hammond, Frank Rodriguez. No direct emails from official sources. Source: jllpartners.com team page'
  },
  // Row 70: Pamlico Capital - verify Scott Perper
  {
    row: 70,
    company: 'Pamlico Capital',
    contact: 'Scott Perper',
    title: 'Managing Partner / Senior Advisor',
    email: '', // No verified email from published sources
    linkedin: 'https://www.linkedin.com/in/scott-perper-7a10b019/',
    status: 'Enriched',
    notes: 'Scott Perper is Senior Advisor (was Managing Partner). No direct email found from official sources. Source: pamlicocapital.com'
  }
];

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // First, read current data to verify row numbers
  const readResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Sheet1!A1:K100',
  });

  const currentData = readResponse.data.values;
  console.log('Current data preview:');
  for (let i = 0; i < Math.min(5, currentData.length); i++) {
    console.log(`Row ${i + 1}:`, currentData[i].slice(0, 3).join(' | '));
  }

  // Prepare batch updates
  const batchData = [];

  for (const update of updates) {
    const rowIndex = update.row;
    
    // Update columns: C=Contact Name, D=Title, E=Email, F=LinkedIn, H=Status, K=Notes
    // Column indices (0-based): C=2, D=3, E=4, F=5, H=7, K=10
    
    batchData.push({
      range: `Sheet1!C${rowIndex}:F${rowIndex}`,
      values: [[
        update.contact,
        update.title,
        update.email,
        update.linkedin
      ]]
    });

    batchData.push({
      range: `Sheet1!H${rowIndex}`,
      values: [[update.status]]
    });

    batchData.push({
      range: `Sheet1!K${rowIndex}`,
      values: [[update.notes]]
    });
  }

  console.log('\nUpdating sheet with', batchData.length, 'range updates...');

  const batchUpdateResponse = await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    resource: {
      valueInputOption: 'USER_ENTERED',
      data: batchData,
    },
  });

  console.log('Updated', batchUpdateResponse.data.totalUpdatedCells, 'cells');
  console.log('\nSummary of updates:');
  for (const update of updates) {
    console.log(`Row ${update.row}: ${update.company} -> ${update.contact} (${update.title})`);
  }
}

updateSheet().catch(console.error);
