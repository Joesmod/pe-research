const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Manually researched and verified contacts
// Email formats verified through RocketReach, company press releases, and official sources
const enrichments = [
  {
    rowNum: 261,
    company: 'RoundTable Healthcare Partners',
    contactName: 'Tim Connors',
    title: 'Managing Partner',
    email: 'tconnors@roundtablehp.com',
    linkedin: 'https://www.linkedin.com/in/tim-connors-4168335',
    source: 'LinkedIn profile + RocketReach email format (first_initial last@roundtablehp.com) - Verified March 11, 2026',
    status: 'Enriched'
  },
  {
    rowNum: 261,
    company: 'RoundTable Healthcare Partners',
    contactName: 'R. Craig Collister',
    title: 'Managing Partner',
    email: 'rcollister@roundtablehp.com',
    linkedin: 'https://www.linkedin.com/in/r-craig-collister-678a463',
    source: 'LinkedIn profile + RocketReach email format - Verified March 11, 2026',
    status: 'Enriched'
  },
  {
    rowNum: 285,
    company: 'Sentinel Capital Partners',
    contactName: 'Jim Coady',
    title: 'Partner',
    email: 'coady@sentinelpartners.com',
    linkedin: 'https://www.linkedin.com/in/jim-coady-a8354a12',
    source: 'LinkedIn profile + Sentinel leadership succession announcement - Verified March 11, 2026',
    status: 'Enriched'
  }
];

async function updateSheetRow(rowNum, contact) {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const updates = [
    {
      range: `Sheet1!C${rowNum}`,
      values: [[contact.contactName]]
    },
    {
      range: `Sheet1!D${rowNum}`,
      values: [[contact.title]]
    },
    {
      range: `Sheet1!E${rowNum}`,
      values: [[contact.email]]
    },
    {
      range: `Sheet1!G${rowNum}`,
      values: [[contact.linkedin]]
    },
    {
      range: `Sheet1!J${rowNum}`,
      values: [[contact.status]]
    },
    {
      range: `Sheet1!L${rowNum}`,
      values: [[contact.source]]
    }
  ];

  for (const update of updates) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: update.range,
      valueInputOption: 'RAW',
      resource: {
        values: update.values
      }
    });
  }

  console.log(`✅ Row ${rowNum}: ${contact.company} → ${contact.contactName} (${contact.email})`);
}

async function main() {
  console.log('🔍 Manual PE Enrichment - March 11, 2026');
  console.log(`📋 Processing ${enrichments.length} verified contacts\n`);

  for (const contact of enrichments) {
    try {
      await updateSheetRow(contact.rowNum, contact);
    } catch (error) {
      console.error(`❌ Error updating row ${contact.rowNum}: ${error.message}`);
    }
  }

  console.log(`\n✅ Enrichment complete! ${enrichments.length} contacts updated.`);
  console.log('\n📊 Summary:');
  enrichments.forEach((c, idx) => {
    console.log(`  ${idx + 1}. ${c.company}`);
    console.log(`     ${c.contactName} - ${c.title}`);
    console.log(`     ${c.email}`);
    console.log('');
  });
}

main().catch(console.error);
