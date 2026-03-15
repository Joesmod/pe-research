const { google } = require('googleapis');
const key = require('./service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

(async () => {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Get headers to find Notes column index
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A1:Z1'
    });

    const headers = res.data.values[0];
    console.log('Headers:', headers);

    // Find the Notes column (or create updates array based on known positions)
    // For now, we'll update specific cells with notes

    const updates = [
      {
        range: 'Sheet1!K974', // Notes column for Bow River Capital (row 974)
        values: [['Email not publicly available. General contact: info@bowrivercapital.com. Dossier created in pe-research/PE-firms/bow-river-capital/']]
      },
      {
        range: 'Sheet1!K975', // Notes column for Amulet Capital (row 975)
        values: [['Email not publicly available. LinkedIn outreach recommended. Dossier created in pe-research/PE-firms/amulet-capital-partners/']]
      },
      {
        range: 'Sheet1!K976', // Notes column for Trivest Partners (row 976)
        values: [['Email not publicly available. Company-first approach, founder-friendly. Dossier created in pe-research/PE-firms/trivest-partners/']]
      }
    ];

    // Batch update
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      resource: {
        valueInputOption: 'RAW',
        data: updates
      }
    });

    console.log('\n✅ Successfully updated notes for 3 new firms');
    console.log('   - Row 974: Bow River Capital');
    console.log('   - Row 975: Amulet Capital Partners');
    console.log('   - Row 976: Trivest Partners');

  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
