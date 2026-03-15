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

async function appendRows(rows) {
  const sheets = await getClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:P',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: rows },
  });
  console.log(`✓ Appended ${rows.length} new rows`);
}

async function main() {
  console.log('=== ADDING NEW PE FIRMS - March 13, 2026 2:37 AM ===\n');
  
  const newFirms = [
    [
      'Trivest Partners', // Company Name
      '', // NotebookLM
      'Chris Weldon', // Contact Name
      'Managing Partner, Mid-Market', // Title
      '', // Email - Pattern found: c****w@trivest.com (SignalHire), needs verification
      'https://www.trivest.com', // Website
      'https://www.linkedin.com/in/jchrisweldon/', // LinkedIn
      'Business Services, Healthcare, Manufacturing, Technology', // Sector Focus
      '', // Portfolio Companies
      'Enriched - Needs Email Verification', // Status
      '', // Last Contacted
      'RocketReach/SignalHire pattern: c****w@trivest.com. Founded 1981. Multi-sector mid-market PE. "Path to 3x" program. Emma Pollock (portfolio tech lead). Also: Michael Rakiter (Partner, Mid-Market), Forest Wester (Managing Partner, Discovery). Charlotte/Chicago/Denver/LA/NY/Toronto offices. [Added: 2026-03-13 2:37 AM cron]', // Notes
      '', // Company Info URL
      '7' // Gumbo Score
    ],
    [
      'Excellere Partners', // Company Name
      '', // NotebookLM
      'Brad Cornell', // Contact Name
      'Managing Partner', // Title
      '', // Email - Pattern found: bcornell@excellerepartners.com (RocketReach), needs verification
      'https://excellere.com', // Website
      'https://www.linkedin.com/in/brad-cornell-016325a3/', // LinkedIn
      'Healthcare, Industrial Growth, Software/SaaS', // Sector Focus
      '', // Portfolio Companies
      'Enriched - Needs Email Verification', // Status
      '', // Last Contacted
      'RocketReach/Salesgear pattern: bcornell@excellerepartners.com. Denver-based. Portfolio: Concord Technologies (healthcare SaaS), Biocare Medical (sold to Agilent 2026-03-09). Other Managing Partners: Ryan Glaws, Matt Hicks, Patrick O\'Keefe. Focus: emerging companies, industry consolidation. [Added: 2026-03-13 2:37 AM cron]', // Notes
      '', // Company Info URL
      '8' // Gumbo Score
    ],
    [
      'Boathouse Capital', // Company Name
      '', // NotebookLM
      'Bill Dyer', // Contact Name
      'Managing Partner', // Title
      '', // Email - Pattern found: bdyer@boathousecapital.com (Apollo.io), needs verification
      'https://boathousecapital.com', // Website
      '', // LinkedIn
      'SaaS/Software, Technology-Enabled Services, Healthcare IT', // Sector Focus
      '', // Portfolio Companies
      'Enriched - Needs Email Verification', // Status
      '', // Last Contacted
      'RocketReach/Apollo.io pattern: bdyer@boathousecapital.com. Philadelphia/Wayne, PA. $350M AUM. Founded 2008. $5M-$40M investments. Flexible debt/equity structures. Other key: Chong Moua (Managing Partner), Andrew Olsen (General Partner), Ken Jones (General Partner). Portfolio: Hoonuit, Versifit Technologies (ed-tech). [Added: 2026-03-13 2:37 AM cron]', // Notes
      '', // Company Info URL
      '8' // Gumbo Score
    ]
  ];
  
  console.log('Adding 3 new mid-market PE firms:\n');
  newFirms.forEach((firm, i) => {
    console.log(`  ${i + 1}. ${firm[0]} - ${firm[2]} (${firm[3]})`);
    console.log(`     ${firm[5]}`);
    console.log(`     Email pattern: ${firm[11].match(/pattern: ([^\s.]+)/)?.[1] || 'not found'}\n`);
  });
  
  await appendRows(newFirms);
  
  console.log('\n✓ New firms added to sheet!');
  console.log('\nNOTE: All 3 firms have email patterns from data providers (RocketReach/Apollo/SignalHire)');
  console.log('      but need verification via subscription or alternate methods.');
}

main().catch(error => {
  console.error('ERROR:', error);
  process.exit(1);
});
