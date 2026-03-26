const {readSheet, updateRow} = require('./sheet.js');

const verifications = [
  {
    row: 573, // Black Dragon Capital - Vineet Begwani
    notes: 'Email vbegwani@blackdragoncap.com verified via ZoomInfo. Vineet Begwani is Principal at Black Dragon Capital, a PE firm based in Delhi. (2026-03-25 cron)',
    status: 'Enriched'
  },
  {
    row: 554, // Afore Capital - Jack McClelland
    notes: 'Email jack@afore.vc verified via LinkedIn profile and jackmcclelland.com. Jack McClelland is Principal at Afore Capital, a $500M AUM pre-seed VC fund. (2026-03-25 cron)',
    status: 'Enriched'
  },
  {
    row: 570, // BDA Partners - Pham Phuoc
    notes: 'Email domain @bdapartners.com confirmed via official bdapartners.com. However, BDA Partners is an M&A investment banking advisory firm, not a PE investor. (2026-03-25 cron)',
    status: 'Dead - Not PE Firm'
  }
];

async function main() {
  const {data} = await readSheet();
  
  for (const verify of verifications) {
    const currentRow = data.find(d => d.rowIndex === verify.row);
    if (!currentRow) {
      console.log(`Row ${verify.row} not found`);
      continue;
    }
    
    const newValues = [...currentRow.values];
    newValues[7] = verify.status;
    newValues[9] = verify.notes;
    
    console.log(`Updating row ${verify.row}: ${currentRow.values[0]} - ${verify.status}`);
    await updateRow(verify.row, newValues);
    console.log(`✓ Updated row ${verify.row}`);
  }
  
  console.log(`\nCompleted ${verifications.length} updates`);
}

main().catch(console.error);
