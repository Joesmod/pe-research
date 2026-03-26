const { google } = require('googleapis');
const fs = require('fs');

async function run() {
  const key = JSON.parse(fs.readFileSync(__dirname + '/service-account.json'));
  const auth = new google.auth.GoogleAuth({ credentials: key, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
  const sheets = google.sheets({ version: 'v4', auth });
  const id = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

  // Get contacts with LinkedIn URLs
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: id, range: 'Contacts!A1:I' });
  const rows = res.data.values || [];
  console.log('Total contacts:', rows.length - 1);

  const withLI = rows.filter((r, i) => i > 0 && r[6] && r[6].includes('linkedin'));
  console.log('With LinkedIn:', withLI.length);

  // Check Sheet1 for who's been emailed
  const s1 = await sheets.spreadsheets.values.get({ spreadsheetId: id, range: 'Sheet1!A1:J' });
  const s1rows = s1.data.values || [];
  const contactedCompanies = new Set();
  s1rows.forEach(r => { if (r[9]) contactedCompanies.add(r[0]); });

  // Check Contacts sheet Last Contacted (col I = index 8)
  const emailedContacts = new Set();
  rows.forEach((r, i) => { if (i > 0 && r[8]) emailedContacts.add(r[2]); }); // by name

  // Build outreach rows
  const outRows = [];
  for (const r of withLI) {
    const company = r[0];
    const name = r[2];
    const title = r[3];
    const li = r[6];
    const wasEmailed = emailedContacts.has(name) || contactedCompanies.has(company);
    const type = wasEmailed ? 'Post Email' : 'Initial';
    const emailRef = wasEmailed ? 'Yes' : 'No';
    outRows.push([name, company, li, type, 'Gumbo', '', 'Pending', '', emailRef]);
  }

  console.log('Rows to add:', outRows.length);

  if (outRows.length > 0) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: id,
      range: 'LinkedIn Outreach!A2',
      valueInputOption: 'RAW',
      requestBody: { values: outRows }
    });
    console.log('Populated!');
  }
}

run().catch(e => console.error(e.message));
