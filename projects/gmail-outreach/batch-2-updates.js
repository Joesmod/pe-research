const { google } = require('googleapis');

// Batch 2 enrichment updates
const updates = [
  // ENRICHED FIRMS
  {
    row: 809, // Victoria Capital Partners
    firm: 'Victoria Capital Partners',
    contactName: 'Carlos Garcia',
    title: 'Chairman & Managing Partner',
    email: 'cgarcia@victoriacp.com',
    linkedin: 'https://www.linkedin.com/in/carlos-garcia-aa0bb313a/',
    notes: 'Email pattern from ZoomInfo. South America-focused PE firm, $3B+ AUM. Founded 2006. Team includes Santiago Cotter (Partner), Alejandro Sorgentini (Partner).',
    status: 'Enriched'
  },
  {
    row: 815, // 26North
    firm: '26North',
    contactName: 'Mark Weinberg',
    title: 'Partner, Head of Private Equity',
    email: 'mweinberg@26n.com',
    linkedin: 'https://www.linkedin.com/in/mark-weinberg-a4612519/',
    notes: 'Email from RocketReach. Founded by Josh Harris (Apollo). Multi-strategy platform: PE, direct lending, insurance. Other partners: Brendan McGovern (Direct Lending), Jon Garcia (Alpha Creation).',
    status: 'Enriched'
  },
  // DEAD FIRMS
  {
    row: 807, // TriplePoint Capital
    firm: 'TriplePoint Capital',
    contactName: 'Jim Labe',
    title: 'CEO',
    status: 'Dead - Venture Debt/Specialty Finance',
    notes: 'Equipment leasing and venture debt provider, not traditional PE. $9B+ in venture financing across 3,000+ companies.'
  },
  {
    row: 816, // 414 Capital
    firm: '414 Capital',
    status: 'Dead - Investment Bank',
    notes: 'M&A advisory and investment banking firm based in Mexico. Services PE firms but does not invest. Lindsey Wendler is MD.'
  }
];

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  console.log(`Updating ${updates.length} records (Batch 2)...\n`);
  
  for (const update of updates) {
    const values = [];
    
    if (update.status && (update.status.startsWith('Dead') || update.status.includes('Debt'))) {
      // For Dead firms, update Notes and Status only
      // Also update Contact Name and Title if provided
      if (update.contactName) {
        values.push([
          update.contactName || '',
          update.title || '',
          '',
          '',
          '',
          '',
          '',
          update.notes || '',
          update.status
        ]);
      } else {
        values.push([
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          update.notes || '',
          update.status
        ]);
      }
      
      const range = `Sheet1!C${update.row}:K${update.row}`;
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        resource: { values }
      });
      
      console.log(`✓ Updated row ${update.row} (${update.firm}): ${update.status}`);
    } else {
      // For Enriched firms, update full contact info
      values.push([
        update.contactName || '',
        update.title || '',
        update.email || '',
        '',
        update.linkedin || '',
        '',
        '',
        update.notes || '',
        update.status || 'Enriched'
      ]);
      
      const range = `Sheet1!C${update.row}:K${update.row}`;
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        resource: { values }
      });
      
      console.log(`✓ Updated row ${update.row} (${update.firm}): ${update.contactName} - ${update.email}`);
    }
  }
  
  console.log('\nBatch 2 updates completed!');
}

updateSheet().catch(console.error);
