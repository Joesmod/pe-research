const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Enrichment data
const enrichments = [
  {
    row: 2, // Audax Private Equity
    contactName: 'Ken MacFadyen',
    title: 'Media Relations',
    email: 'media@audaxprivateequity.com',
    linkedin: '',
    status: 'Enriched',
    source: 'BusinessWire press release Dec 2025 (official media contact)'
  },
  {
    row: 10, // Alvarez & Marsal Capital
    contactName: 'David Perskie',
    title: 'Partner',
    email: 'david@a-mcapital.com',
    linkedin: 'https://www.linkedin.com/company/alvarez-marsal-capital-partners',
    status: 'Enriched',
    source: 'PR Newswire Feb 2026 press release. Pattern first@a-mcapital.com (70.1% LeadIQ). Quoted in official release.'
  },
  {
    row: 15, // JLL Partners
    contactName: 'Johanna Doherty',
    title: 'Media Contact',
    email: 'j.doherty@jllpartners.com',
    linkedin: '',
    status: 'Enriched',
    source: 'BusinessWire press release Oct 2022 (official media contact). Phone: (212) 210-9390'
  },
  {
    row: 18, // Gryphon Investors
    contactName: 'Sandy McKinnon',
    title: 'Managing Director, Software',
    email: 'mckinnon@gryphoninvestors.com',
    linkedin: 'https://www.linkedin.com/in/sandy-mckinnon-b9b0a112',
    status: 'Enriched',
    source: 'LinkedIn + pattern last@gryphoninvestors.com (primary pattern per NeverBounce)'
  },
  {
    row: 20, // Charlesbank Capital Partners
    contactName: 'Michael Choe',
    title: 'Managing Partner, CEO, Co-Head Flagship',
    email: 'mchoe@charlesbank.com',
    linkedin: 'https://www.charlesbank.com/team/michael-choe',
    status: 'Enriched',
    source: 'Firm team page. Pattern first_initial last@charlesbank.com (89.6% RocketReach)'
  },
  {
    row: 25, // Huron Capital
    contactName: 'Mike Beauregard',
    title: 'Founding Partner, Investment Committee',
    email: 'mbeauregard@huroncapital.com',
    linkedin: 'https://www.linkedin.com/in/beauregardmike',
    status: 'Enriched',
    source: 'LinkedIn. Pattern firstinitial+lastname@huroncapital.com (HighPerformr)'
  },
  {
    row: 48, // Riverside Partners
    contactName: 'David Del Papa',
    title: 'General Partner',
    email: 'ddelpapa@riversidepartners.com',
    linkedin: 'https://www.linkedin.com/in/david-del-papa',
    status: 'Enriched',
    source: 'LinkedIn. Pattern first_initial last@riversidepartners.com (92.9% RocketReach). Contact page: info@riversidepartners.com'
  }
];

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  console.log('\n🔄 Starting enrichment updates...\n');

  // Column indices (based on inspection)
  const contactIdx = 2;  // C: Contact Name
  const titleIdx = 3;    // D: Title
  const emailIdx = 4;    // E: Email
  const linkedinIdx = 6; // G: LinkedIn (might vary)
  const statusIdx = 9;   // J: Status
  const sourceIdx = 8;   // I: Source/Notes

  for (const enrich of enrichments) {
    console.log(`Updating Row ${enrich.row}: ${enrich.contactName} at company...`);

    // Build updates array
    const updates = [
      {
        range: `Sheet1!C${enrich.row}`,
        values: [[enrich.contactName]]
      },
      {
        range: `Sheet1!D${enrich.row}`,
        values: [[enrich.title]]
      },
      {
        range: `Sheet1!E${enrich.row}`,
        values: [[enrich.email]]
      },
      {
        range: `Sheet1!G${enrich.row}`,
        values: [[enrich.linkedin]]
      },
      {
        range: `Sheet1!I${enrich.row}`,
        values: [[enrich.source]]
      },
      {
        range: `Sheet1!J${enrich.row}`,
        values: [[enrich.status]]
      }
    ];

    // Batch update
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: updates
      }
    });

    console.log(`  ✅ Updated: ${enrich.contactName} (${enrich.title}) - ${enrich.email}`);
  }

  console.log(`\n✨ Enrichment complete! Updated ${enrichments.length} leads.\n`);
}

main().catch(console.error);
