const { google } = require('googleapis');
const key = require('./service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Enrichment data from research (2026-03-05)
const enrichments = {
  'Transact Capital Partners': {
    contactName: 'Tony Vincent',
    title: 'Managing Director',
    email: 'Tony@TransactCapital.com',
    linkedin: 'https://www.linkedin.com/company/transact-capital-partners',
    status: 'Enriched',
    notes: 'Email verified from company press releases (transactcapital.com)'
  },
  'Pace Capital': {
    contactName: 'Jordan Cooper',
    title: 'Co-Founder & General Partner',
    email: 'jordan@pacecapital.com',
    linkedin: 'https://www.linkedin.com/in/jordancooper/',
    status: 'Enriched',
    notes: 'Email verified from personal blog. Co-Founders: Jordan Cooper & Chris Paik'
  },
  'McWin Capital Partners': {
    contactName: 'Henry McGovern',
    title: 'Founding Partner',
    email: '',
    linkedin: 'https://mcwin.fund/our-team/',
    status: 'Partial',
    notes: 'Founding Partner (with Steven K. Winegar). Team: mcwin.fund/our-team/'
  },
  'Thayer Street Partners': {
    contactName: 'Josh Koplewicz',
    title: 'Managing Partner',
    email: 'admin@thayerstreet.com',
    linkedin: 'https://thayerstreet.com/',
    status: 'Partial',
    notes: 'Managing Partner. General contact only: admin@thayerstreet.com'
  },
  'Turn/River Capital': {
    contactName: 'Dominic Ang',
    title: 'Managing Partner',
    email: '',
    linkedin: 'https://www.linkedin.com/company/turn-river-capital',
    status: 'Partial',
    notes: 'Managing Partner identified. Site blocked by Cloudflare.'
  },
  'Union Park Capital': {
    contactName: 'Morgan Jones',
    title: 'Managing Partner & Founder',
    email: '',
    linkedin: 'https://www.linkedin.com/in/morganjones3/',
    status: 'Partial',
    notes: 'Founder. Co-Founder: Peter McGuire. Team: union-park.com/team.html'
  },
  'Washington Harbour Partners': {
    contactName: 'Mina Faltas',
    title: 'Founder & CIO',
    email: '',
    linkedin: 'https://www.linkedin.com/in/mina-faltas-washington-harbour-partners',
    status: 'Partial',
    notes: 'Founder/CIO. Team: washingtonharbour.com/our-team/'
  },
  'Stonelake Capital Partners': {
    contactName: 'Kenneth E. Aboussie, Jr.',
    title: 'Co-Founder & Managing Partner',
    email: '',
    linkedin: 'https://stonelake.com/stonelake-team/',
    status: 'Partial',
    notes: 'Co-Founder/Managing Partner (with John Kiltz). Team: stonelake.com/stonelake-team/'
  },
  'Kline Hill Partners': {
    contactName: 'Michael Bego',
    title: 'Managing Partner',
    email: '',
    linkedin: 'https://www.linkedin.com/company/kline-hill-partners',
    status: 'Partial',
    notes: 'Managing Partner confirmed via firm website and press. Co-Partner: Jared Barlow'
  }
};

(async () => {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    // Read all data
    console.log('Reading sheet data...\n');
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:K',
    });

    const rows = res.data.values;
    if (!rows || rows.length === 0) {
      console.error('No data found in sheet');
      return;
    }

    let updatedCount = 0;

    // Find and update each firm
    for (let i = 1; i < rows.length; i++) { // Start at 1 to skip header
      const firmName = rows[i][0]; // Column A
      
      if (enrichments[firmName]) {
        const update = enrichments[firmName];
        const rowNum = i + 1; // Sheet rows are 1-indexed
        const range = `Sheet1!C${rowNum}:K${rowNum}`;

        // Preserve existing data in columns we're not updating
        const existingRow = rows[i];
        const sectors = existingRow[7] || ''; // Column H (Sectors)

        const values = [[
          update.contactName || existingRow[2] || '',        // C: Contact Name
          update.title || existingRow[3] || '',               // D: Title
          update.email || existingRow[4] || '',               // E: Email
          existingRow[5] || '', // F: (preserve existing)
          update.linkedin || existingRow[6] || '',            // G: LinkedIn
          sectors,              // H: Sectors (preserve)
          update.notes || existingRow[8] || '',               // I: Notes
          update.status || existingRow[9] || '',              // J: Status
          new Date().toISOString().split('T')[0]              // K: Timestamp
        ]];

        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range,
          valueInputOption: 'USER_ENTERED',
          resource: { values }
        });

        console.log(`✅ Row ${rowNum}: ${firmName}`);
        console.log(`   Contact: ${update.contactName} (${update.title})`);
        if (update.email) {
          console.log(`   Email: ${update.email} ✉️`);
        }
        console.log(`   Status: ${update.status}\n`);
        
        updatedCount++;
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    console.log('═══════════════════════════════════════');
    console.log(`✅ Enrichment complete!`);
    console.log(`📊 Total firms updated: ${updatedCount}`);
    console.log(`✉️  Verified direct emails: 2 (Tony Vincent, Jordan Cooper)`);
    console.log(`👤 Decision-makers identified: ${updatedCount - 2}`);
    console.log('═══════════════════════════════════════');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
})();
