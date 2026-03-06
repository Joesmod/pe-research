const { google } = require('googleapis');
const key = require('./service-account.json');

async function findTargets() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A:J'
  });

  const rows = res.data.values;
  const midMarketTargets = [];

  for (let i = 1; i < rows.length; i++) {
    const company = rows[i][0] || '';
    const website = rows[i][1] || '';
    const contactName = rows[i][2] || '';
    const email = rows[i][4] || '';
    const status = rows[i][8] || '';
    
    const needsWork = (!contactName || !email || email.startsWith('info@') || email.startsWith('sales@'));
    const isNew = (status === 'New - Unresearched' || status === 'Partial' || status === '');
    
    if (needsWork && isNew && company && website && i > 200 && i < 350) {
      midMarketTargets.push({
        row: i + 1,
        company,
        website,
        status,
        email
      });
    }
  }

  console.log('Mid-market PE firms (rows 200-350) needing enrichment:\n');
  midMarketTargets.slice(0, 10).forEach((t, idx) => {
    console.log(`${idx + 1}. ${t.company} (Row ${t.row})`);
    console.log(`   Website: ${t.website}`);
    console.log(`   Status: ${t.status || 'Unknown'}`);
    console.log();
  });
}

findTargets().catch(console.error);
