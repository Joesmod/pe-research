const { google } = require('googleapis');

// Batch 3: Final enrichments
const updates = [
  {
    row: 813, // Yellowstone Capital Partners
    firm: 'Yellowstone Capital Partners, LLC',
    contactName: 'Sami Sawaf',
    title: 'Managing Partner',
    email: 's.sawaf@yellowstonecapital.com',
    linkedin: 'https://www.linkedin.com/in/sami-sawaf-8570a939/',
    notes: 'Email from ContactOut/Apollo.io. Founded 1993, Houston/NY-based PE firm. Focus on management buyouts and mezzanine finance for SMBs. Partners: Randy Burns, Rick Harris (Operating Partner).',
    status: 'Enriched'
  },
  {
    row: 806, // Trinity Investors
    firm: 'Trinity Investors',
    contactName: 'Dan Meader',
    title: 'Managing Partner',
    email: 'dmeader@trinitypeg.com',
    linkedin: 'https://www.linkedin.com/in/dan-meader-cfa-cpa-03377113/',
    notes: 'Email from RocketReach. Southlake, TX-based PE firm. Co-Managing Partners: Dan Meader (CFA, CPA) and Sanjay Chandra (schandra@trinitypeg.com). Uses both @trinitypeg.com and @trinityinvestors.com domains.',
    status: 'Enriched'
  }
];

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  console.log(`Updating ${updates.length} records (Batch 3 - Final)...\n`);
  
  for (const update of updates) {
    const values = [[
      update.contactName || '',
      update.title || '',
      update.email || '',
      '',
      update.linkedin || '',
      '',
      '',
      update.notes || '',
      update.status || 'Enriched'
    ]];
    
    const range = `Sheet1!C${update.row}:K${update.row}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      resource: { values }
    });
    
    console.log(`✓ Updated row ${update.row} (${update.firm}): ${update.contactName} - ${update.email}`);
  }
  
  console.log('\nBatch 3 (Final) updates completed!');
  console.log('\n=== ENRICHMENT SUMMARY ===');
  console.log('Total Enriched PE Firms: 5');
  console.log('- Riverwood Capital (Jeff Parks)');
  console.log('- Victoria Capital Partners (Carlos Garcia)');
  console.log('- 26North (Mark Weinberg)');
  console.log('- Yellowstone Capital Partners (Sami Sawaf)');
  console.log('- Trinity Investors (Dan Meader)');
  console.log('\nTotal Dead/Non-PE Firms Marked: 5');
  console.log('- Tennenbaum Capital Partners (Acquired by BlackRock)');
  console.log('- Trinity Capital (BDC/Venture Debt)');
  console.log('- Centerview Partners (Investment Bank)');
  console.log('- TriplePoint Capital (Venture Debt)');
  console.log('- 414 Capital (Investment Bank)');
}

updateSheet().catch(console.error);
