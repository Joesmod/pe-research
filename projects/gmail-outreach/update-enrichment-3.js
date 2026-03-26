const {google} = require('googleapis');
const key = require('./service-account.json');

async function updateSheet() {
  const auth = new google.auth.JWT(key.client_email, null, key.private_key, ['https://www.googleapis.com/auth/spreadsheets']);
  const sheets = google.sheets({version: 'v4', auth});
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

  // Read current data
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:K',
  });

  const rows = res.data.values;
  const updates = [];

  // Blackford Capital
  const blackfordIdx = rows.findIndex(r => r[0] === 'Blackford Capital');
  if (blackfordIdx > 0) {
    const rowNum = blackfordIdx + 1;
    updates.push({
      range: 'Sheet1!C' + rowNum + ':K' + rowNum,
      values: [['Martin Stein', 'Founder & Managing Director', 'mstein@blackfordcapital.com', 'https://www.blackfordcapital.com', 'https://www.linkedin.com/in/martin-stein-blackford/', 'Business services, Healthcare, Manufacturing', 'Email pattern from RocketReach (m******@blackfordcapital.com) and Apollo (m**@). Grand Rapids MI-based, 18+ years PE experience.', 'Enriched', '2026-03-17']]
    });
  }

  // Kinzie Capital Partners
  const kinzieIdx = rows.findIndex(r => r[0] === 'Kinzie Capital Partners');
  if (kinzieIdx > 0) {
    const rowNum = kinzieIdx + 1;
    updates.push({
      range: 'Sheet1!C' + rowNum + ':K' + rowNum,
      values: [['Suzanne Yoon', 'Founder & Managing Partner', 'syoon@kinziecp.com', 'https://www.kinziecp.com', 'https://www.linkedin.com/in/suzanneyoon/', 'Manufacturing, Business Services, Consumer', 'Email pattern from RocketReach (s******@kinziecp.com). Chicago-based, lower middle market focus.', 'Enriched', '2026-03-17']]
    });
  }

  // New Water Capital
  const newwaterIdx = rows.findIndex(r => r[0] === 'New Water Capital');
  if (newwaterIdx > 0) {
    const rowNum = newwaterIdx + 1;
    updates.push({
      range: 'Sheet1!C' + rowNum + ':K' + rowNum,
      values: [['Jason Neimark', 'Partner & Founder', 'jneimark@newwatercap.com', 'https://www.newwatercap.com', 'https://www.linkedin.com/in/jason-neimark/', 'Multi-industry, Turnaround, Special situations', 'Email pattern from RocketReach (j******@newwatercap.com). 30 years mezzanine/PE experience, previously Sun Capital Partners.', 'Enriched', '2026-03-17']]
    });
  }

  // Ample Bright Capital
  const ampleIdx = rows.findIndex(r => r[0] === 'Ample Bright Capital');
  if (ampleIdx > 0) {
    const rowNum = ampleIdx + 1;
    updates.push({
      range: 'Sheet1!C' + rowNum + ':K' + rowNum,
      values: [['Veena Anand', 'Managing Partner & Co-Founder', 'veena@amplebrightcapital.com', 'https://www.amplebrightcapital.com', 'https://www.linkedin.com/in/veena-anand/', 'Healthcare, Healthcare IT, Software, Food & Beverage', 'Email format from Tomba.io ({first}@amplebrightcapital.com). Chicago Booth MBA, 20+ years PE/consulting experience.', 'Enriched', '2026-03-17']]
    });
  }

  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      resource: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
    console.log('Updated ' + updates.length + ' rows successfully.');
    console.log('Firms enriched (batch 3):');
    if (blackfordIdx > 0) console.log('- Blackford Capital: Martin Stein');
    if (kinzieIdx > 0) console.log('- Kinzie Capital Partners: Suzanne Yoon');
    if (newwaterIdx > 0) console.log('- New Water Capital: Jason Neimark');
    if (ampleIdx > 0) console.log('- Ample Bright Capital: Veena Anand');
  } else {
    console.log('No matching firms found to update.');
  }
}

updateSheet().catch(console.error);
