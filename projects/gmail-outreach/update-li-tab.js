const { google } = require('googleapis');
const fs = require('fs');

async function run() {
  const key = JSON.parse(fs.readFileSync(__dirname + '/service-account.json'));
  const auth = new google.auth.GoogleAuth({ credentials: key, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
  const sheets = google.sheets({ version: 'v4', auth });
  const id = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

  // 1. Update From column based on Type
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: id, range: 'LinkedIn Outreach!A2:I' });
  const rows = res.data.values || [];
  console.log('Total rows:', rows.length);

  const fromUpdates = [];
  for (let i = 0; i < rows.length; i++) {
    const type = rows[i][3] || '';
    const from = type === 'Post Email' ? 'Steve' : 'Gumbo';
    fromUpdates.push([from]);
  }

  // Batch update From column (E)
  await sheets.spreadsheets.values.update({
    spreadsheetId: id,
    range: `LinkedIn Outreach!E2:E${rows.length + 1}`,
    valueInputOption: 'RAW',
    requestBody: { values: fromUpdates }
  });
  console.log('Updated From column:', fromUpdates.filter(r => r[0] === 'Steve').length, 'Steve,', fromUpdates.filter(r => r[0] === 'Gumbo').length, 'Gumbo');

  // 2. Create Replied/Active tab
  try {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: id,
      requestBody: {
        requests: [{
          addSheet: { properties: { title: 'Replied / Active' } }
        }]
      }
    });
    console.log('Created Replied / Active tab');
  } catch (e) {
    if (e.message.includes('already exists')) {
      console.log('Replied / Active tab already exists');
    } else throw e;
  }

  // Add headers
  await sheets.spreadsheets.values.update({
    spreadsheetId: id,
    range: 'Replied / Active!A1:J1',
    valueInputOption: 'RAW',
    requestBody: {
      values: [['Name', 'Company', 'LinkedIn URL', 'Email', 'Source Channel', 'Reply Date', 'Status', 'Notes', 'Next Step', 'Owner']]
    }
  });
  console.log('Headers added to Replied / Active tab');
}

run().catch(e => console.error(e.message));
