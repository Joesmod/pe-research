const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = './service-account.json';

// New mid-market PE firms ($500M-$5B AUM, services-heavy)
const NEW_FIRMS = [
  {
    company: 'Paine Schwartz Partners',
    website: 'https://www.paineschwartz.com',
    contact: 'Sam Mencoff',
    title: 'Managing Partner & CEO',
    email: '', // Need to research
    linkedin: 'https://www.linkedin.com/in/sam-mencoff/',
    status: 'Research',
    notes: '$2.3B AUM, food & agriculture focused, San Francisco. Added 2026-03-14 cron.'
  },
  {
    company: 'Revelstoke Capital Partners',
    website: 'https://www.revelstokecp.com',
    contact: 'Michael Kim',
    title: 'Managing Partner',
    email: '', // Need to research
    linkedin: 'https://www.linkedin.com/company/revelstoke-capital-partners/',
    status: 'Research',
    notes: '$1.4B AUM, healthcare services focused, Denver. Added 2026-03-14 cron.'
  },
  {
    company: 'TowerBrook Capital Partners',
    website: 'https://www.towerbrook.com',
    contact: 'Ramez Sousou',
    title: 'Managing Partner',
    email: '', // Need to research
    linkedin: 'https://www.linkedin.com/company/towerbrook-capital-partners/',
    status: 'Research',
    notes: '$10B+ AUM, business services & consumer, New York/London. Added 2026-03-14 cron.'
  },
  {
    company: 'LFM Capital',
    website: 'https://www.lfmcapital.com',
    contact: 'Peter Castleman',
    title: 'Founder & Managing Partner',
    email: '', // Need to research
    linkedin: 'https://www.linkedin.com/company/lfm-capital/',
    status: 'Research',
    notes: '$1B+ AUM, business services focused, Philadelphia. Added 2026-03-14 cron.'
  }
];

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  console.log('\n📝 Adding new PE firms to the sheet...\n');
  
  // First, find the last row with data
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:A',
  });
  
  const lastRow = response.data.values ? response.data.values.length : 1;
  const startRow = lastRow + 1;
  
  console.log(`Last row with data: ${lastRow}`);
  console.log(`Starting at row: ${startRow}\n`);
  
  // Prepare rows for batch insert
  const rows = NEW_FIRMS.map(firm => [
    firm.company,      // A: Company Name
    firm.website,      // B: NotebookLM/Website
    firm.contact,      // C: Contact Name
    firm.title,        // D: Title
    firm.email,        // E: Email
    '',                // F: Website (duplicate of B)
    firm.linkedin,     // G: LinkedIn
    firm.status,       // H: Status
    firm.notes         // I: Notes
  ]);
  
  // Insert new rows
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `Sheet1!A${startRow}`,
    valueInputOption: 'RAW',
    requestBody: {
      values: rows
    }
  });
  
  console.log('✅ Added firms:\n');
  NEW_FIRMS.forEach((firm, idx) => {
    console.log(`${idx + 1}. ${firm.company}`);
    console.log(`   ${firm.contact} - ${firm.title}`);
    console.log(`   ${firm.notes}`);
    console.log('');
  });
  
  console.log(`\n📊 Total added: ${NEW_FIRMS.length} firms`);
  console.log(`⚠️  These firms need email enrichment via Apollo or web research.`);
}

main().catch(console.error);
