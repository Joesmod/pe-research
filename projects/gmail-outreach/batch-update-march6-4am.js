const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const credentials = JSON.parse(fs.readFileSync('service-account.json', 'utf8'));

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

// Additional enrichments from research
const enrichments = [
  {
    rowIndex: 749,
    firmName: 'Hermitage Capital',
    contactName: 'Sean Xiang',
    title: 'Founder & CEO',
    email: '',
    linkedin: 'https://www.hermitagecap.com/team',
    notes: 'China/HK tech PE/VC. Also: Henry Zhang (President & Managing Partner), Simon Wong (Partner). No public emails found.',
    status: 'Partial'
  },
  {
    rowIndex: 746,
    firmName: 'Great Point Partners',
    contactName: '',
    title: '',
    email: 'Pro-gpp@profileadvisors.com',
    linkedin: 'https://www.gppfunds.com',
    notes: 'Healthcare PE. Media contact: Profile Advisors PR firm. Need direct contact search.',
    status: 'Partial'
  },
  {
    rowIndex: 735,
    firmName: 'DLP Capital',
    contactName: '',
    title: '',
    email: '',
    linkedin: 'https://www.dlpcapital.com',
    notes: 'Real estate focused. Multiple MDs found but no published emails. Apollo search returned titles only.',
    status: 'Partial'
  },
  {
    rowIndex: 736,
    firmName: 'Driehaus Capital Management LLC',
    contactName: '',
    title: '',
    email: '',
    linkedin: 'https://www.driehaus.com',
    notes: 'Investment management firm. President & CEO role exists. No public contact emails found.',
    status: 'Partial'
  },
  {
    rowIndex: 742,
    firmName: 'Excelsior Equity Partners',
    contactName: '',
    title: '',
    email: '',
    linkedin: 'https://excelsiordynamic.com',
    notes: 'Alternative asset manager, legal finance niche. Phone: (650) 484-0975. No team page or emails published.',
    status: 'Partial'
  }
];

(async () => {
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  
  console.log(`Updating ${enrichments.length} additional enrichments...\n`);
  
  for (const enrichment of enrichments) {
    const { rowIndex, firmName, contactName, title, email, linkedin, notes, status } = enrichment;
    
    // Column C = Contact Name, D = Title, E = Email, F = LinkedIn, I = Notes, J = Status
    const updates = [
      {
        range: `Sheet1!C${rowIndex}`,
        values: [[contactName]]
      },
      {
        range: `Sheet1!D${rowIndex}`,
        values: [[title]]
      },
      {
        range: `Sheet1!E${rowIndex}`,
        values: [[email]]
      },
      {
        range: `Sheet1!F${rowIndex}`,
        values: [[linkedin]]
      },
      {
        range: `Sheet1!I${rowIndex}`,
        values: [[notes]]
      },
      {
        range: `Sheet1!J${rowIndex}`,
        values: [[status]]
      }
    ];
    
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
    
    console.log(`✓ Updated Row ${rowIndex}: ${firmName} (${status})`);
  }
  
  console.log(`\n✅ Successfully updated ${enrichments.length} rows`);
  console.log('\nSummary of all enrichments this session:');
  console.log('- 1 firm marked Dead (Carmel Capital - not PE)');
  console.log('- 1 firm fully enriched with verified email (Gridiron Capital)');
  console.log('- 6 firms partially enriched with names/titles/research notes');
  console.log('Total: 8 firms processed\n');
  
})().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
