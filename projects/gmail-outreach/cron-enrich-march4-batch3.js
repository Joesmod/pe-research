const { google } = require('googleapis');
const key = require('./service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const auth = new google.auth.GoogleAuth({
  credentials: key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

const batch3Findings = [
  { row: 687, company: 'Valiant Capital Management',
    name: 'Christopher R. Hansen', title: 'Founder & President',
    email: 'contact@valiantcapital.com',
    linkedin: 'https://en.wikipedia.org/wiki/Chris_R._Hansen',
    source: 'Wikipedia + company website' },
  
  { row: 694, company: 'Yellowstone Capital Partners',
    name: 'Juan Carlos Moreno', title: 'Co-Founder & CIO',
    email: 'jcmoreno@yellowstonecp.com',
    linkedin: 'https://www.linkedin.com/company/yellowstone-capital-partners',
    source: 'RocketReach + CAIA bio' },
  
  { row: 695, company: '3 Rivers Capital',
    name: 'Dale Buckwalter', title: 'Co-Founder & Managing Partner',
    email: 'buckwalter@3riverscap.com',
    linkedin: 'https://www.linkedin.com/in/dalebuckwalter3rc/',
    source: 'Growjo/Salesgear email pattern + LinkedIn' }
];

async function updateSheet(rowNum, contact) {
  const updates = [
    {
      range: `Sheet1!C${rowNum}`,
      values: [[contact.name]]
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
      values: [['Enriched']]
    },
    {
      range: `Sheet1!L${rowNum}`,
      values: [[`Manual research ${new Date().toISOString().split('T')[0]} - ${contact.source}`]]
    }
  ];
  
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      data: updates,
      valueInputOption: 'RAW'
    }
  });
  
  console.log(`  ✓ Sheet updated (row ${rowNum})`);
}

async function main() {
  console.log('PE Research & Enrichment - Batch 3 (Final)');
  console.log('='.repeat(70));
  
  for (const finding of batch3Findings) {
    console.log(`\n[${finding.company}]`);
    console.log(`  ${finding.name} - ${finding.title}`);
    console.log(`  Email: ${finding.email}`);
    console.log(`  Source: ${finding.source}`);
    
    await updateSheet(finding.row, finding);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '='.repeat(70));
  console.log(`TOTAL: ${batch3Findings.length} firms enriched in batch 3`);
  console.log('CUMULATIVE: 12 total firms enriched today');
  console.log('='.repeat(70));
}

main().catch(console.error);
