const {readSheet, updateRow} = require('./sheet.js');

const verifications = [
  {
    row: 563, // Archer Capital Group - Greg Martin
    notes: 'Email gmartin@archervc.com verified via archercapg.com team page. Greg Martin is Founder and Managing Director. Note: Archer Venture Capital is a VC firm. (2026-03-25 cron)',
    status: 'Enriched'
  },
  {
    row: 574, // BlueWave Resource Partners - Laura Danforth
    notes: 'Email laura@bluewaverp.com verified via bluewaverp.com. However, BlueWave is a staffing/recruiting firm, not a PE investor. (2026-03-25 cron)',
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
