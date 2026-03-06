const { google } = require('googleapis');
const key = require('./service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Final batch of enrichments
const firms = {
  'Clearlake Capital Group': {
    contactName: 'Behdad Eghbali',
    title: 'Co-Founder & Managing Partner',
    email: '',
    linkedin: 'https://www.linkedin.com/company/clearlake-capital-group',
    status: 'Partial',
    notes: 'Co-Founders: Behdad Eghbali & Jose Feliciano (both Managing Partners). $85B+ AUM.'
  },
  'Genstar Capital': {
    contactName: 'Ryan Clark',
    title: 'President & Managing Director',
    email: '',
    linkedin: 'https://www.linkedin.com/company/genstar-capital',
    status: 'Partial',
    notes: 'President: Ryan Clark. MDs: Rob Rutledge, Anthony Salewski, Eli Weiss. Email domain: @gencap.com'
  },
  'Gryphon Investors': {
    contactName: 'R. David Andrews',
    title: 'Founder, Co-CEO & Managing Partner',
    email: '',
    linkedin: 'https://www.linkedin.com/company/gryphon-investors',
    status: 'Partial',
    notes: 'Founder/Co-CEO: David Andrews. Co-CEO/CIO: Nicholas Orum. Team: gryphon-inv.com/team/'
  }
};

(async () => {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    console.log('Reading sheet...\n');
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:K'
    });

    const rows = res.data.values;
    let updated = 0;

    for (let i = 1; i < rows.length; i++) {
      const firmName = rows[i][0];
      
      if (firms[firmName]) {
        const update = firms[firmName];
        const rowNum = i + 1;
        const existingRow = rows[i];
        const sectors = existingRow[7] || '';

        const range = `Sheet1!C${rowNum}:K${rowNum}`;
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

        console.log(`✅ Row ${rowNum}: ${firmName}`);
        console.log(`   Contact: ${update.contactName} (${update.title})`);
        console.log(`   Status: ${update.status}\n`);
        
        updated++;
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    console.log('═══════════════════════════════════════');
    console.log(`✅ Final batch complete!`);
    console.log(`📊 Firms updated: ${updated}`);
    console.log('═══════════════════════════════════════');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
