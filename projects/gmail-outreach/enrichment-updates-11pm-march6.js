const { google } = require('googleapis');
const creds = require('./service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const updates = [
  {
    row: 3, // Knox Lane
    name: 'Tommy Richardson',
    email: 'trichardson@knoxlane.com',
    linkedIn: 'https://www.linkedin.com/in/techdadda/',
    status: 'Enriched',
    notes: 'Operating Partner at Knox Lane, 25+ years exec/GM experience'
  },
  {
    row: 11, // Baymark Partners
    name: 'David J. Hook',
    email: 'dhook@baymarkpartners.com',
    linkedIn: 'https://www.linkedin.com/in/davidjhook/',
    status: 'Enriched',
    notes: 'Managing Director, PE investor since 1982'
  },
  {
    row: 4, // Centerfield Capital (referral)
    name: 'Troy Clark',
    email: 'troy@centerfieldcapital.com',
    linkedIn: '',
    status: 'Enriched',
    notes: 'Partner (Junior Capital). Also: Augie Pence (augie@), Tye Stebbins (tye@)'
  },
  {
    row: 14, // The Orpheum (Needleman Group)
    name: '',
    email: 'info@madisonorpheum.com',
    linkedIn: '',
    status: 'Research',
    notes: 'Venue in Madison WI. Generic contact email. Need to find Needleman Group connection/owner.'
  },
  {
    row: 2, // Charlesbank
    name: '',
    email: 'pro-charlesbank@prosek.com',
    linkedIn: '',
    status: 'Research',
    notes: 'Only media/PR contact found. Need direct decision-maker contact.'
  }
];

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const sheets = google.sheets({ version: 'v4', auth });

  console.log('=== ENRICHMENT UPDATE PLAN ===\n');
  
  for (const update of updates) {
    console.log(`Row ${update.row}: ${update.name || '(pending)'}`);
    console.log(`  Email: ${update.email}`);
    console.log(`  Status: ${update.status}`);
    console.log(`  Notes: ${update.notes}\n`);

    // Prepare batch update
    const range = `Tracker!A${update.row}:J${update.row}`;
    const values = [[
      update.name,
      '', // NotebookLM
      '', // Company (don't change)
      update.linkedIn,
      update.email,
      '', // Source Channel (don't change)
      '', // Reply Date
      update.status,
      update.notes,
      '' // Next Step
    ]];

    // Get current row to preserve Company name
    const current = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range
    });

    const currentRow = current.data.values ? current.data.values[0] : [];
    values[0][2] = currentRow[2] || ''; // Preserve Company
    values[0][5] = currentRow[5] || ''; // Preserve Source Channel

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range,
      valueInputOption: 'RAW',
      resource: { values }
    });

    console.log(`✓ Updated row ${update.row}`);
  }

  console.log('\n=== ENRICHMENT COMPLETE ===');
  console.log(`Updated ${updates.length} leads in Tracker sheet`);
}

// Run if called directly
if (require.main === module) {
  updateSheet().catch(console.error);
}

module.exports = { updateSheet, updates };
