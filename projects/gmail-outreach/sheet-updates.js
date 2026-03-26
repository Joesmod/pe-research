const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const updates = [
  // Status updates for firms with good data
  {
    row: 14,
    company: 'ShoreView Industries',
    updates: { H: 'Enriched' },
    note: 'Status updated - contact verified from firm website'
  },
  {
    row: 36,
    company: 'Cressey & Company',
    updates: { 
      C: 'Bryan Cressey',
      D: 'Managing Partner',
      E: 'bcressey@cresseyco.com',
      G: 'https://www.linkedin.com/in/bryan-cressey/',
      H: 'Enriched',
      I: 'Founder & Managing Partner. Email verified from ContactOut. (2026-03-16 cron)'
    },
    note: 'Fixed contact - was showing wrong person (Mark Gormley from Lee Equity)'
  },
  {
    row: 131,
    company: 'Stellex Capital Management',
    updates: { H: 'Enriched' },
    note: 'Status updated - contact verified'
  },
  {
    row: 176,
    company: 'Hg Capital',
    updates: { H: 'Enriched' },
    note: 'Status updated - EA contact verified'
  },
  {
    row: 180,
    company: 'Revelstoke Capital Partners',
    updates: { H: 'Enriched' },
    note: 'Status updated - founder contact verified'
  },
  {
    row: 184,
    company: 'Gridiron Capital',
    updates: { H: 'Enriched' },
    note: 'Status updated - MD/CFO contact verified'
  },
  {
    row: 191,
    company: 'Flexpoint Ford',
    updates: { H: 'Enriched' },
    note: 'Status updated - MD contact verified'
  },
  {
    row: 192,
    company: 'NewSpring Capital',
    updates: { H: 'Enriched' },
    note: 'Status updated - co-founder contact verified'
  },
  {
    row: 198,
    company: 'Valeas Capital Partners',
    updates: { H: 'Enriched' },
    note: 'Status updated - co-founder contact verified'
  },
  {
    row: 220,
    company: 'WindPoint Partners',
    updates: { H: 'Enriched' },
    note: 'Status updated - MD contact verified'
  },
  {
    row: 223,
    company: 'Harvest Partners (SCF)',
    updates: { H: 'Enriched' },
    note: 'Status updated - VP contact verified'
  },
];

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  console.log(`Updating ${updates.length} rows...\n`);
  
  for (const update of updates) {
    console.log(`Row ${update.row}: ${update.company}`);
    console.log(`  ${update.note}`);
    
    // Build update requests for each cell
    const updateData = [];
    for (const [col, value] of Object.entries(update.updates)) {
      updateData.push({
        range: `Sheet1!${col}${update.row}`,
        values: [[value]]
      });
    }
    
    if (updateData.length > 0) {
      try {
        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: SHEET_ID,
          requestBody: {
            valueInputOption: 'RAW',
            data: updateData
          }
        });
        console.log(`  ✓ Updated successfully`);
      } catch (error) {
        console.error(`  ✗ Error:`, error.message);
      }
    }
    console.log('');
    
    // Rate limit
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('Done!');
}

updateSheet().catch(console.error);
