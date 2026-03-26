const { google } = require('googleapis');

async function updateWynnchurch() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

    // Update row 861 (first Wynnchurch entry)
    // Columns: C=Contact, D=Title, E=Email, G=LinkedIn, H=Status, I=Notes
    const updates = [
      {
        range: 'Sheet1!C861:I861',
        values: [[
          'John Hatherly',
          'Managing Partner, Founder',
          'jhatherly@wynnchurch.com',
          '',
          'https://www.linkedin.com/in/john-hatherly-4b772112/',
          'Enriched',
          'Founded Wynnchurch Capital in 1999. Email verified from multiple BusinessWire press releases (2020-2021). Source: https://www.businesswire.com/news/home/20210408005532/en/ (2026-03-15 cron)'
        ]]
      }
    ];

    for (const update of updates) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: update.range,
        valueInputOption: 'RAW',
        resource: { values: update.values }
      });
      console.log(`Updated ${update.range}`);
    }

    console.log('\\nSuccessfully enriched Wynnchurch Capital');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

updateWynnchurch();
