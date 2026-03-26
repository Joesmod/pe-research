const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = require('./service-account.json');

const updates = [
  {
    row: 2,
    company: 'Audax Private Equity',
    contact: 'Young Lee',
    title: 'Partner and Co-President',
    email: '',
    linkedin: 'https://www.linkedin.com/in/young-lee-3404b45b/',
    status: 'Needs Email',
    notes: 'Young Lee confirmed as Partner and Co-President. Previous contact Andy Unanue is with AUA Private Equity (different firm). Email pattern not verified from published source. (2026-03-17 cron)'
  },
  {
    row: 1081,
    company: 'Ridgemont Equity Partners',
    contact: 'Scott Poole',
    title: 'Partner',
    email: 'SPoole@ridgemontep.com',
    linkedin: 'https://www.linkedin.com/in/scott-poole-44780630/',
    status: 'Enriched',
    notes: 'Partner at Ridgemont Equity Partners. Email pattern verified via RocketReach and confirmed as Partner on LinkedIn. (2026-03-17 cron)'
  },
  {
    row: 1190,
    company: 'Five Elms Capital',
    contact: 'Fred Coulson',
    title: 'Founder & Managing Partner',
    email: 'fred@fiveelms.com',
    linkedin: 'https://www.linkedin.com/in/fcoulson/',
    status: 'Enriched',
    notes: 'Founder & Managing Partner at Five Elms Capital. Email pattern verified via ZoomInfo and RocketReach. Official team page confirms role. (2026-03-17 cron)'
  },
  {
    row: 1217,
    company: 'Rockwood Equity Partners',
    contact: 'Kate Faust',
    title: 'Partner, Business Development',
    email: 'kfaust@rockwoodequity.com',
    linkedin: 'https://www.linkedin.com/in/katefaust',
    status: 'Enriched',
    notes: 'Partner of Business Development at Rockwood Equity Partners. Email VERIFIED from published BusinessWire press release (June 2024). (2026-03-17 cron)'
  }
];

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    credentials: SERVICE_ACCOUNT,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  for (const update of updates) {
    const row = update.row;
    
    // Column mapping: C=Contact, D=Title, E=Email, G=LinkedIn, H=Status, I=Notes
    const values = [[
      update.contact,        // C (index 2)
      update.title,          // D (index 3)
      update.email,          // E (index 4)
      '',                    // F (index 5) - skip
      update.linkedin,       // G (index 6)
      update.status,         // H (index 7)
      update.notes           // I (index 8)
    ]];
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Sheet1!C${row}:I${row}`,
      valueInputOption: 'RAW',
      requestBody: { values }
    });
    
    console.log(`✅ Updated Row ${row}: ${update.company} - ${update.contact}`);
  }
  
  console.log(`\n🎉 Successfully enriched ${updates.length} leads!`);
}

updateSheet().catch(console.error);
