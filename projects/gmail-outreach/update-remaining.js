const { google } = require('googleapis');
const key = require('./service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const updates = [
  {
    row: 440, // Transact Capital Partners, LLC
    firm: 'Transact Capital Partners, LLC',
    contactName: 'Tony Vincent',
    title: 'Managing Director',
    email: 'Tony@TransactCapital.com',
    linkedin: 'https://www.linkedin.com/company/transact-capital-partners',
    status: 'Enriched',
    notes: 'Email VERIFIED from company press releases (transactcapital.com). MD for M&A transactions.'
  },
  {
    row: 444, // Washington Harbour Partners LP
    firm: 'Washington Harbour Partners LP',
    contactName: 'Mina Faltas',
    title: 'Founder & Chief Investment Officer',
    email: '',
    linkedin: 'https://www.linkedin.com/in/mina-faltas-washington-harbour-partners',
    status: 'Partial',
    notes: 'Founder/CIO. Previously Co-Founder of Nokota Management ($2.7B). Team: washingtonharbour.com/our-team/'
  }
];

(async () => {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    console.log('Updating remaining firms...\n');

    // Read current data for these rows
    for (const update of updates) {
      const readRange = `Sheet1!A${update.row}:K${update.row}`;
      const readRes = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: readRange
      });

      const existingRow = readRes.data.values ? readRes.data.values[0] : [];
      const sectors = existingRow[7] || '';

      const range = `Sheet1!C${update.row}:K${update.row}`;
      const values = [[
        update.contactName,
        update.title,
        update.email,
        existingRow[5] || '',
        update.linkedin,
        sectors,
        update.notes,
        update.status,
        new Date().toISOString().split('T')[0]
      ]];

      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range,
        valueInputOption: 'USER_ENTERED',
        resource: { values }
      });

      console.log(`✅ Row ${update.row}: ${update.firm}`);
      console.log(`   Contact: ${update.contactName} (${update.title})`);
      if (update.email) {
        console.log(`   ✉️  Email: ${update.email}`);
      }
      console.log(`   Status: ${update.status}\n`);

      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log('═══════════════════════════════════════');
    console.log('✅ Update complete!');
    console.log(`📊 Additional firms: ${updates.length}`);
    console.log('═══════════════════════════════════════');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
