const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

async function getClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function addNewFirms() {
  const sheets = await getClient();
  
  // Prepare new firm rows
  // Columns: Company Name, NotebookLM, Contact Name, Title, Email, Website, LinkedIn, Sector Focus, Portfolio Companies, Status, Last Contacted, Notes, Company Info URL, Gumbo Score
  
  const newFirms = [
    [
      'Accel-KKR',  // Company Name
      '',  // NotebookLM (empty for now)
      'Tom Barnds',  // Contact Name
      'Co-Managing Partner',  // Title
      'tom.barnds@accel-kkr.com',  // Email (inferred pattern)
      'https://www.accel-kkr.com',  // Website
      'https://www.linkedin.com/company/accel-kkr',  // LinkedIn
      'Software, SaaS, Tech-Enabled Services',  // Sector Focus
      'Health Metrics, CareLineLive, Arbiter',  // Portfolio Companies (recent 2025)
      'Enriched',  // Status
      '',  // Last Contacted
      '$23B+ cumulative capital. Software-focused mid-market PE. 2025 acquisitions: Health Metrics (healthcare analytics), CareLineLive (home care workforce mgmt), Arbiter (sports compliance). Co-Managing Partners: Tom Barnds & Rob Palumbo. IR: Patrick Fallon (MD/COO/Head IR). Email pattern: first.last@accel-kkr.com (standard). Enriched 2026-03-10 cron.',  // Notes
      'https://www.accel-kkr.com/team/',  // Company Info URL
      '9'  // Gumbo Score
    ],
    [
      'JMI Equity',  // Company Name
      '',  // NotebookLM
      'Peter Arrowsmith',  // Contact Name
      'Managing Partner',  // Title
      'peter.arrowsmith@jmi.com',  // Email (inferred pattern)
      'https://www.jmi.com',  // Website
      'https://www.linkedin.com/company/jmi-equity',  // LinkedIn
      'Enterprise Software, Vertical SaaS, AI-Driven',  // Sector Focus
      'Agiloft, Canto, Coursedog, EdSights, SafetyChain, Seismic, Vena Solutions, Yello',  // Portfolio Companies
      'Enriched',  // Status
      '',  // Last Contacted
      'Founded 1992, 30+ years backing software and AI-driven companies. Managing Partner: Peter Arrowsmith (30yr at JMI). Co-Founder: Harry Gruner. San Diego HQ. Stage-agnostic growth equity. Email pattern: first.last@jmi.com (standard). Portfolio focused on data, automation, AI to enhance performance/scalability. Enriched 2026-03-10 cron.',  // Notes
      'https://www.jmi.com/people/',  // Company Info URL
      '9'  // Gumbo Score
    ]
  ];
  
  console.log('Adding 2 new PE firms to sheet...\n');
  
  // Append to Sheet1
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:N',  // Columns A through N
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: newFirms
    }
  });
  
  console.log('✅ Successfully added 2 firms:');
  console.log('   1. Accel-KKR (Tom Barnds, Co-Managing Partner)');
  console.log('   2. JMI Equity (Peter Arrowsmith, Managing Partner)');
  console.log('\nBoth firms have:');
  console.log('   - Verified contact names and titles');
  console.log('   - Inferred emails using standard patterns');
  console.log('   - Gumbo Score: 9/10 (strong software/SaaS/AI focus)');
  console.log('   - Status: Enriched');
  console.log('   - Notes with AUM, portfolio, and context');
  console.log('\nNote: Email patterns are inferred (standard first.last@ format).');
  console.log('Verify before sending cold outreach.');
}

addNewFirms().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
