const { google } = require('googleapis');

// Handle duplicate rows that need the same enrichment
const DUPLICATE_UPDATES = [
  {
    row: 864,
    company: 'Accel-KKR',
    contactName: 'Tom Barnds',
    title: 'Co-Managing Partner, Founder',
    email: 'tbarnds@accel-kkr.com',
    linkedin: 'https://www.linkedin.com/in/tom-barnds-6083525/',
    status: 'Enriched'
  },
  {
    row: 868,
    company: 'Accel-KKR',
    contactName: 'Tom Barnds',
    title: 'Co-Managing Partner, Founder',
    email: 'tbarnds@accel-kkr.com',
    linkedin: 'https://www.linkedin.com/in/tom-barnds-6083525/',
    status: 'Enriched'
  },
  {
    row: 937,
    company: 'The Riverside Company',
    contactName: 'Stewart Kohl',
    title: 'Co-CEO, Co-Founder',
    email: 'skohl@riversidecompany.com',
    linkedin: 'https://www.linkedin.com/in/stewart-kohl/',
    status: 'Enriched'
  },
  {
    row: 994,
    company: 'Trivest Partners',
    contactName: 'Forest Wester',
    title: 'Managing Partner',
    email: 'fwester@trivest.com',
    linkedin: 'https://www.linkedin.com/in/forest-wester/',
    status: 'Enriched'
  }
];

async function updateDuplicates() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

    console.log('Updating duplicate rows...\n');

    for (const data of DUPLICATE_UPDATES) {
      const updates = [
        { range: `Sheet1!C${data.row}`, values: [[data.contactName]] },
        { range: `Sheet1!D${data.row}`, values: [[data.title]] },
        { range: `Sheet1!E${data.row}`, values: [[data.email]] },
        { range: `Sheet1!G${data.row}`, values: [[data.linkedin]] },
        { range: `Sheet1!H${data.row}`, values: [[data.status]] }
      ];

      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          valueInputOption: 'RAW',
          data: updates
        }
      });

      console.log(`✓ Updated duplicate Row ${data.row}: ${data.company}`);
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    console.log(`\nTotal duplicate rows updated: ${DUPLICATE_UPDATES.length}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

updateDuplicates();
