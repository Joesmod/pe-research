const {readSheet, updateRow} = require('./sheet.js');

const verifications = [
  {
    row: 564, // Arrowroot Capital Management - Matthew Safaii
    notes: 'Email msafaii@arrowrootcapital.com verified via arrowrootcapital.com team page. Matthew J. Safaii is Founder and Managing Partner. (2026-03-25 cron)',
    status: 'Enriched'
  },
  {
    row: 370, // Carrick Capital Partners - Rob Delaney
    notes: 'Email rdelaney@carrickcapitalpartners.com pattern verified via RocketReach and LeadIQ. Rob Delaney promoted to Managing Director and Partner (Jan 2025). Software-focused PE firm. (2026-03-25 cron)',
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
    
    console.log(`Updating row ${verify.row}: ${currentRow.values[0]} - ${verify.status}`);
    await updateRow(verify.row, newValues);
    console.log(`✓ Updated row ${verify.row}`);
  }
  
  console.log(`\nCompleted ${verifications.length} updates`);
}

main().catch(console.error);
