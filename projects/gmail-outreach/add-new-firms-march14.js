const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = './service-account.json';

// New firms to add - verified info only (NO guessed emails)
const newFirms = [
  {
    company: 'Rockwood Equity',
    website: 'https://www.rockwoodequity.com',
    contactName: 'Brett Keith',
    title: 'Managing Partner',
    email: '', // Pattern inferred but not verified from official source
    companyUrl: 'https://www.rockwoodequity.com/team/brett-keith/',
    linkedin: 'https://www.linkedin.com/in/brett-keith-7355b011/',
    status: 'Enriched - Needs Email Verification',
    notes: 'Lower middle-market PE. B2B services, healthcare, aerospace & defense. Offices in Cleveland, Denver, NYC. 24+ portfolio companies. Brett Keith confirmed as Managing Partner via official website. Email pattern inferred from RocketReach (b***@rockwoodequity.com) but not verified from published source. (2026-03-14 cron)',
    gumboScore: '8'
  },
  {
    company: 'Linden Capital Partners',
    website: 'https://www.linden.com',
    contactName: 'Anthony B. Davis',
    title: 'Managing Partner',
    email: '', // Not found from official source
    companyUrl: 'https://www.linden.com/team/investment-team/anthony-davis/',
    linkedin: '', // Need to search
    status: 'Enriched - Needs Email Verification',
    notes: 'Middle-market healthcare & life sciences PE. Structured Capital Fund II at $400M (2024). Chicago-based. Anthony B. Davis confirmed as Managing Partner via official team page. Email not found from published sources. (2026-03-14 cron)',
    gumboScore: '8'
  },
  {
    company: 'Lightyear Capital',
    website: 'https://www.lycap.com',
    contactName: '', // Need to research team page
    title: '',
    email: '',
    companyUrl: 'https://www.lycap.com',
    linkedin: '',
    status: 'Needs Manual Research',
    notes: 'Sector-specialist PE firm ~$5B+ AUM. Founded 2000, NYC-based. Financial services, fintech, healthcare, business services focus. Contact info needs manual research. (2026-03-14 cron)',
    gumboScore: '7'
  },
  {
    company: 'One Equity Partners',
    website: 'https://www.oneequity.com',
    contactName: '', // Need to research team page
    title: '',
    email: '',
    companyUrl: 'https://www.oneequity.com',
    linkedin: '',
    status: 'Needs Manual Research',
    notes: 'Middle market PE. Industrial, healthcare, technology sectors. North America and Europe focus. Contact info needs manual research. (2026-03-14 cron)',
    gumboScore: '7'
  }
];

async function addFirmsToSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  console.log('📊 Adding new PE firms to Sheet1...\n');
  
  // Get current row count
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:A',
  });
  
  const currentRows = response.data.values ? response.data.values.length : 0;
  const nextRow = currentRows + 1;
  
  console.log(`Current rows in sheet: ${currentRows}`);
  console.log(`Next available row: ${nextRow}\n`);
  
  // Prepare rows to append
  const rowsToAdd = newFirms.map(firm => [
    firm.company,          // A: Company Name
    firm.website,          // B: NotebookLM/Website
    firm.contactName,      // C: Contact Name
    firm.title,            // D: Title
    firm.email,            // E: Email
    firm.companyUrl,       // F: Company Info URL
    firm.linkedin,         // G: LinkedIn
    firm.status,           // H: Status
    firm.notes,            // I: Notes
    '',                    // J: CRM Status
    '',                    // K: Last Contacted
    '',                    // L: Additional Notes
    firm.companyUrl,       // M: Company Info URL (duplicate for consistency)
    firm.gumboScore        // N: Gumbo Score
  ]);
  
  // Append rows
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:N',
    valueInputOption: 'RAW',
    requestBody: {
      values: rowsToAdd
    }
  });
  
  console.log(`✅ Added ${newFirms.length} new firms to the sheet (rows ${nextRow}-${nextRow + newFirms.length - 1})\n`);
  
  // Print summary
  console.log('📋 Firms added:\n');
  newFirms.forEach((firm, idx) => {
    console.log(`${idx + 1}. ${firm.company}`);
    console.log(`   Website: ${firm.website}`);
    console.log(`   Contact: ${firm.contactName || '(EMPTY)'} / ${firm.title || '(EMPTY)'}`);
    console.log(`   Status: ${firm.status}`);
    console.log('');
  });
  
  console.log('✅ CRON TASK COMPLETE');
  console.log('\nSummary:');
  console.log('- Primary task: All 1197 existing firms already enriched ✓');
  console.log('- Secondary task: Added 4 new mid-market PE firms');
  console.log('- 2 firms have verified contacts (Brett Keith, Anthony Davis)');
  console.log('- 2 firms need manual contact research (Lightyear, One Equity)');
  console.log('- NO emails added (patterns inferred but not verified from published sources)');
}

addFirmsToSheet().catch(console.error);
