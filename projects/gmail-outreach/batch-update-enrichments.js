const {readSheet, updateRow} = require('./sheet.js');

const verifications = [
  {
    row: 543,
    notes: 'Email verified via suncappart.com team page. Senior Managing Director & Partner, Co-Head of US Transaction Team. 23 years with Sun Capital. (2026-03-25 cron)',
    status: 'Enriched'
  },
  {
    row: 544,
    notes: 'Email tbrooker@svoco.com verified via svoco.com team page and ContactOut. Managing Director and Operating Partner. (2026-03-25 cron)',
    status: 'Enriched'
  },
  {
    row: 546,
    notes: 'Email verified via ttcp.com. David York is Chairman and Founder/Managing Director at TTCP. (2026-03-25 cron)',
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
    newValues[7] = verify.status; // Status column
    newValues[9] = verify.notes; // Notes column
    
    console.log(`Verifying row ${verify.row}: ${currentRow.values[0]} - ${currentRow.values[2]}`);
    await updateRow(verify.row, newValues);
    console.log(`✓ Verified row ${verify.row}`);
  }
  
  console.log(`\nCompleted ${verifications.length} verifications`);
}

main().catch(console.error);
