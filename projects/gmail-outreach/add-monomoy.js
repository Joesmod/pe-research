const {google} = require('googleapis');

async function addMonomoy() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({version: 'v4', auth});
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const newRow = [
    'Monomoy Capital Partners',
    'https://www.mcpfunds.com',
    'Renn Iaboni',
    'Managing Director (Business Development)',
    'riaboni@mcpfunds.com',
    'https://www.mcpfunds.com',
    'https://www.linkedin.com/company/monomoy-capital-partners',
    'Industrial, Consumer, Business Services',
    'Greenwich CT / NYC-based middle market PE. ~$4B AUM. Focus: market-leading industrial & consumer businesses where operational expertise creates value. Recent exit: Astro Shapes (Jan 2025). Investment team led by Jaime Forsyth (Partner).',
    'Enriched',
    'Email verified from official Monomoy press releases (Jan 2024, Feb 2025, July 2025). Also: John Miller (VP BD, jmiller@mcpfunds.com), Ashley Johansen (IR). Pattern: firstinitiallastname@mcpfunds.com. General: info@mcpfunds.com, (212) 699-4000. [2026-03-08 cron]'
  ];
  
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Sheet1!A:K',
    valueInputOption: 'RAW',
    resource: {
      values: [newRow]
    }
  });
  
  console.log('✅ Added Monomoy Capital Partners');
}

addMonomoy().catch(console.error);
