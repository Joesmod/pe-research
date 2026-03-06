const { google } = require('googleapis');
const key = require('./service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const auth = new google.auth.GoogleAuth({
  credentials: key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

async function updateSheet() {
  const updates = [
    {
      row: 259,
      company: 'BayBoston Capital',
      contactName: 'Carlos M. Garcia',
      title: 'Founder & Managing Partner',
      email: 'carlos@bayboston.com',
      linkedin: 'https://www.linkedin.com/company/bayboston-capital',
      status: 'Enriched',
      notes: 'Verified from bayboston.com - Also available: Mike Fischer (Principal) mike@bayboston.com'
    },
    {
      row: 664,
      company: 'Provident Healthcare Partners',
      contactName: 'Scott Davis',
      title: 'Managing Director',
      email: 'sdavis@providenthp.com',
      linkedin: 'https://www.linkedin.com/in/scott-a-davis-19394313/',
      status: 'Enriched',
      notes: 'Email format verified from providenthp.com team page - Healthcare investment banking'
    },
    {
      row: 670,
      company: 'ScaleView Partners',
      contactName: 'Gabe Wilcox',
      title: 'Co-Founder & Partner',
      email: 'info@scaleviewpartners.com',
      linkedin: 'https://scaleviewpartners.com/',
      status: 'Partial',
      notes: 'General contact info - Tech-focused investment bank. Partners: Gabe Wilcox, Jay Snodgrass, Jordan Davidson. Phone: (512) 549-6358'
    }
  ];

  console.log('Updating Google Sheet with enriched data...\n');

  for (const update of updates) {
    console.log(`Row ${update.row}: ${update.company}`);
    console.log(`  → ${update.contactName} (${update.title})`);
    console.log(`  → ${update.email}\n`);

    const range = `Sheet1!C${update.row}:L${update.row}`;
    const values = [[
      update.contactName,
      update.title,
      update.email,
      '', // Website (don't overwrite)
      update.linkedin,
      '', // Sector (don't overwrite)
      '', // Portfolio (don't overwrite)
      update.status,
      new Date().toISOString().split('T')[0],
      update.notes
    ]];

    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range,
        valueInputOption: 'RAW',
        requestBody: { values }
      });
      console.log(`  ✅ Updated successfully`);
    } catch (err) {
      console.error(`  ❌ Error: ${err.message}`);
    }
  }

  console.log('\n=== UPDATE COMPLETE ===');
  console.log(`Total firms enriched: ${updates.length}`);
}

updateSheet().catch(console.error);
