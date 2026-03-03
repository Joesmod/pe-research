const {google} = require('googleapis');
const path = require('path');
(async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'service-account.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({version: 'v4', auth: await auth.getClient()});
  await sheets.spreadsheets.values.append({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A1',
    valueInputOption: 'RAW',
    requestBody: {
      values: [[
        'Southfield Capital',
        'Bob Root / Jason Perlroth',
        'TRANSFORMATION Partner / Principal, Head of BD',
        'jfinkel@southfieldcapital.com',
        'https://www.southfieldcapital.com',
        'https://www.linkedin.com/company/southfield-capital-advisors',
        'Outsourced Business Services',
        'Contextual.io (AI), Milrose, BDR, Kelvin, Alba Wheels Up, Protos Security',
        'Priority - Enriched',
        '',
        'PRIORITY 9/10. Acquired Contextual.io AI platform Jan 2026. Bob Root = TRANSFORMATION Partner (unique title). Andy Levison (Founder/MP). Jason Perlroth (Head BD). Chris Grambling (Partner). Vince Tyra (Partner). jfinkel@southfieldcapital.com verified (PRNewswire). info@southfieldcapital.com. Phone: 203.813.4100. Greenwich CT + Bellevue WA.',
        'https://www.southfieldcapital.com/team',
        '9'
      ]]
    }
  });
  console.log('Added Southfield Capital');
})().catch(e => { console.error(e.message); process.exit(1); });
