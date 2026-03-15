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

async function updateRow(rowNum, updates) {
  const sheets = await getClient();
  const range = `Sheet1!A${rowNum}:P${rowNum}`;
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [updates] },
  });
  console.log(`✓ Updated Row ${rowNum}`);
}

async function main() {
  console.log('=== MANUAL ENRICHMENT UPDATE - March 13, 2026 2:37 AM ===\n');
  
  // Row 11: Blue Star Innovation Partners
  console.log('Row 11: Blue Star Innovation Partners - Rob Wechsler');
  const row11 = [
    'Blue Star Innovation Partners',
    'https://bluestarinnovationpartners.com',
    'Rob Wechsler',
    'Founder & Managing Partner',
    '', // Email: No verified direct email found
    'https://bluestarinnovationpartners.com',
    'https://www.linkedin.com/in/robert-wechsler-002bab2/',
    'Software, Payments, Technology',
    '', // Portfolio Companies
    'Enriched - Needs Manual Verification',
    '', // Last Contacted
    'ZoomInfo pattern: r***@bluestarinnovationpartners.com. No direct email published on official team page. Serial entrepreneur, 4 exits, ran Chase Merchant Services. Dan Wechsler (CEO/MP) also on team. Team page: https://bluestarinnovationpartners.com/team/ (verified 2026-03-13 cron). Only public email: privacy@bluestarinnovationpartners.com. Need ContactOut/RocketReach subscription or cold outreach via LinkedIn.',
    '', // Company Info URL
    '6', // Gumbo Score
    '' // NotebookLM
  ];
  await updateRow(11, row11);
  
  // Row 1064: The Riverside Company
  console.log('\nRow 1064: The Riverside Company - Stewart Kohl');
  const row1064 = [
    'The Riverside Company',
    '', // NotebookLM
    'Stewart Kohl',
    'Co-CEO & Founder',
    '', // Email: No verified direct email found
    'https://www.riversidecompany.com',
    '', // LinkedIn
    '', // Sector Focus
    '', // Portfolio Companies
    'Enriched - Needs Manual Verification',
    '', // Last Contacted
    'ZoomInfo pattern: s***@riversidecompany.com. Co-CEO with Béla Szigethy. $14B+ AUM. Cleveland-based. Team page: https://www.riversidecompany.com/team/bela-szigethy-stewart-kohl/ (verified 2026-03-13 cron). No direct email published. Need ContactOut/RocketReach subscription or cold outreach via LinkedIn.',
    '', // Company Info URL
    '8', // Gumbo Score
    ''
  ];
  await updateRow(1064, row1064);
  
  // Row 1065: North Castle Partners
  console.log('\nRow 1065: North Castle Partners - Jon Canarick');
  const row1065 = [
    'North Castle Partners',
    '', // NotebookLM
    'Jon Canarick',
    'Managing Partner',
    'jon@northcastlepartners.com', // Email found via ContactOut
    'https://northcastlepartners.com',
    'https://www.linkedin.com/in/jon-canarick-4340362/',
    '', // Sector Focus
    '', // Portfolio Companies
    'Enriched',
    '', // Last Contacted
    'ContactOut-verified: jon@northcastlepartners.com (also jon.canarick@gmail.com listed). 20+ years consumer PE experience. Team page: https://northcastlepartners.com/our-team/jon-canarick/ (verified 2026-03-13 cron). Source: ContactOut (published source). [Enriched: 2026-03-13 2:37 AM cron]',
    '', // Company Info URL
    '7', // Gumbo Score
    ''
  ];
  await updateRow(1065, row1065);
  
  // Row 1066: Genstar Capital
  console.log('\nRow 1066: Genstar Capital - Ryan Clark');
  const row1066 = [
    'Genstar Capital',
    '', // NotebookLM
    'J. Ryan Clark',
    'President & Managing Director',
    '', // Email: No verified direct email found
    'https://www.gencap.com',
    '', // LinkedIn
    'Financial Services, Software, Industrial Technology, Healthcare',
    '', // Portfolio Companies
    'Enriched - Needs Manual Verification',
    '', // Last Contacted
    '$19B AUM. President & MD: J. Ryan Clark. Also: Jean-Pierre Conte (MD & Chairman), Rob Rutledge (MD), Anthony Salewski (MD), Eli Weiss (MD). Generic email: ir@gencap.com. No team page or direct emails published on gencap.com. SF-based. Need ContactOut/RocketReach subscription. Press releases mention Clark actively. (verified 2026-03-13 cron)',
    '', // Company Info URL
    '8', // Gumbo Score
    ''
  ];
  await updateRow(1066, row1066);
  
  console.log('\n\n=== ENRICHMENT COMPLETE ===');
  console.log('✅ Enriched: 1 (North Castle Partners - verified email)');
  console.log('⚠️  Needs Manual: 3 (BSIP, Riverside, Genstar - email patterns found but not publicly verified)');
  console.log('\nNOTE: For BSIP, Riverside, and Genstar, consider:');
  console.log('  1. ContactOut/RocketReach subscription to verify email patterns');
  console.log('  2. Cold outreach via LinkedIn InMail');
  console.log('  3. Call front desk for direct line/email');
}

main().catch(error => {
  console.error('ERROR:', error);
  process.exit(1);
});
