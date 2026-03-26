const {readSheet, updateRow} = require('./sheet.js');

const verifications = [
  {
    row: 547,
    notes: 'Email verified via ZoomInfo. Asia Brumwell is Partner/Vice President at Triton Pacific Capital Partners. (2026-03-25 cron)',
    status: 'Enriched'
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
    
    console.log(`Verifying row ${verify.row}: ${currentRow.values[0]} - ${currentRow.values[2]}`);
    await updateRow(verify.row, newValues);
    console.log(`✓ Verified row ${verify.row}`);
  }
  
  console.log(`\nCompleted ${verifications.length} verifications`);
}

main().catch(console.error);
