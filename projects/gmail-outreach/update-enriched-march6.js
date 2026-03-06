const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const credentials = JSON.parse(fs.readFileSync('service-account.json', 'utf8'));

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

// Enrichments to update
const enrichments = [
  {
    rowIndex: 724,
    firmName: 'Carmel Capital Partners',
    contactName: '',
    title: '',
    email: '',
    linkedin: '',
    notes: 'Wealth management firm, not PE. Helps individuals/families with wealth management.',
    status: 'Dead - Not PE Firm'
  },
  {
    rowIndex: 747,
    firmName: 'Gridiron Capital LLC',
    contactName: 'Thomas A. Burger Jr.',
    title: 'Co-Founder & Managing Partner',
    email: 'tburger@gridironcapital.com',
    linkedin: 'https://gridironcapital.com/gridiron-capital-recognized-as-a-top-founder-friendly-investor/',
    notes: 'Email verified from official press release (gridironcapital.com). 20+ years in PE.',
    status: 'Enriched'
  },
  {
    rowIndex: 748,
    firmName: 'Hall Capital Holdings, LLC',
    contactName: 'Bill Hood III',
    title: 'Managing Member & Founder',
    email: '',
    linkedin: 'https://www.linkedin.com/company/hall-capital-holdings-llc',
    notes: 'Family office, lower middle market PE. 38+ years experience. Email pattern not published.',
    status: 'Partial'
  }
];

(async () => {
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  
  console.log(`Updating ${enrichments.length} enrichments...\n`);
  
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
  
})().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
