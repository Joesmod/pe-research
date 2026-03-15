const { google } = require('googleapis');

const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Findings from manual web research
const findings = [
  {
    row: 161,
    company: 'Thomas H. Lee Partners',
    contact: 'Joshua Nelson',
    title: 'Managing Director, Head of Healthcare Group',
    email: '',  // Cannot verify exact email per instructions
    linkedin: 'https://thl.com/people/joshua-nelson/',
    status: 'Needs Manual Research',
    notes: 'Found Joshua Nelson (MD, Head of Healthcare) on thl.com/people. Email pattern at THL appears to be @thl.com but exact format unverified. Research date: 2026-03-11'
  },
  {
    row: 285,
    company: 'Sentinel Capital Partners',
    contact: 'Marissa Sutker',
    title: 'Managing Director, Head of Investor Relations',
    email: '',  // Cannot verify without direct source
    linkedin: 'https://www.sentinelpartners.com/team/',
    status: 'Needs Manual Research',
    notes: 'Found Marissa Sutker (MD, IR) via RocketReach. Email pattern: [last]@sentinelpartners.com per RocketReach but needs verification. Team page: sentinelpartners.com/team. Research date: 2026-03-11'
  }
];

// Initialize Google Sheets
async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  return google.sheets({ version: 'v4', auth });
}

// Update row with findings
async function updateRow(sheets, rowIndex, finding) {
  const updates = [];
  
  // Only update if we have verified data
  if (finding.contact) {
    updates.push({ range: `Sheet1!C${rowIndex}`, values: [[finding.contact]] });
  }
  if (finding.title) {
    updates.push({ range: `Sheet1!D${rowIndex}`, values: [[finding.title]] });
  }
  if (finding.email) {
    updates.push({ range: `Sheet1!E${rowIndex}`, values: [[finding.email]] });
  }
  if (finding.linkedin) {
    updates.push({ range: `Sheet1!G${rowIndex}`, values: [[finding.linkedin]] });
  }
  
  // Always update status and notes
  updates.push({ range: `Sheet1!J${rowIndex}`, values: [[finding.status]] });
  updates.push({ range: `Sheet1!L${rowIndex}`, values: [[finding.notes]] });
  
  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      resource: {
        data: updates,
        valueInputOption: 'RAW'
      }
    });
  }
}

// Update all rows with remaining as "Needs Manual Research"
async function updateAllRows() {
  console.log('📝 Updating Google Sheet with research findings...\n');
  
  const sheets = await getSheets();
  
  // Rows that need manual research with Apollo failure noted
  const apolloFailedRows = [176, 220, 223, 234, 261, 276, 282, 283, 286, 300, 305, 306, 307];
  
  // Update rows with findings
  for (const finding of findings) {
    console.log(`✅ Row ${finding.row}: ${finding.company} - ${finding.contact || 'Partial info found'}`);
    await updateRow(sheets, finding.row, finding);
  }
  
  // Update remaining rows with Apollo failure note
  for (const rowIndex of apolloFailedRows) {
    console.log(`📝 Row ${rowIndex}: Updating with Apollo failure note`);
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      resource: {
        data: [
          { range: `Sheet1!J${rowIndex}`, values: [['Needs Manual Research']] },
          { range: `Sheet1!L${rowIndex}`, values: [['Apollo API: No results found. Manual research required for contact discovery. Date: 2026-03-11']] }
        ],
        valueInputOption: 'RAW'
      }
    });
  }
  
  console.log('\n✅ Sheet updated with research findings');
  console.log(`\n📊 Summary:`);
  console.log(`  - Partial findings (contact identified): ${findings.length}`);
  console.log(`  - Apollo failed (need manual research): ${apolloFailedRows.length}`);
  console.log(`  - Total processed: ${findings.length + apolloFailedRows.length}`);
  console.log(`\n📅 ${new Date().toLocaleString()}`);
}

updateAllRows().catch(console.error);
