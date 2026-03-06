const { google } = require('googleapis');
const key = require('./service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const auth = new google.auth.GoogleAuth({
  credentials: key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

const batch2Findings = [
  { row: 679, company: 'Springboard Enterprises',
    name: 'Natalie Buford-Young', title: 'CEO',
    email: 'natalie@sb.co',
    linkedin: 'https://www.linkedin.com/in/nbuford-young/',
    source: 'ContactOut + email pattern [first]@sb.co' },
  
  { row: 682, company: 'TAP Advisors',
    name: 'Karim F. Tabet', title: 'Founding Partner',
    email: 'info@tapadvisors.com',
    linkedin: 'https://www.linkedin.com/in/karim-tabet-75352823/',
    source: 'Company website + LinkedIn' },
  
  { row: 686, company: 'Traction Capital',
    name: 'Shane Erickson', title: 'Founder & Managing Partner',
    email: 'shane@tractioncapital.com',
    linkedin: 'https://www.linkedin.com/in/shaneerickson/',
    source: 'Growjo email pattern + LinkedIn' },
  
  { row: 689, company: 'Virtas Partners',
    name: 'Neal McNamara', title: 'CEO & Founder',
    email: 'contact@virtaspartners.com',
    linkedin: 'https://virtaspartners.com/our-team/',
    source: 'Company website team page' },
  
  { row: 693, company: 'Yellow Wood Partners',
    name: 'Dana Schmaltz', title: 'Managing Partner',
    email: 'info@yellowwoodpartners.com',
    linkedin: 'https://www.linkedin.com/in/dana-schmaltz-a1a56918/',
    source: 'LinkedIn + company contact page' }
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
  console.log('PE Research & Enrichment - Batch 2');
  console.log('='.repeat(70));
  
  for (const finding of batch2Findings) {
    console.log(`\n[${finding.company}]`);
    console.log(`  ${finding.name} - ${finding.title}`);
    console.log(`  Email: ${finding.email}`);
    console.log(`  Source: ${finding.source}`);
    
    await updateSheet(finding.row, finding);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '='.repeat(70));
  console.log(`TOTAL: ${batch2Findings.length} firms enriched in batch 2`);
  console.log('CUMULATIVE: 9 total firms enriched today');
  console.log('='.repeat(70));
}

main().catch(console.error);
