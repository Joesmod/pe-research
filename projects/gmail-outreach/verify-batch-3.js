const {readSheet, updateRow} = require('./sheet.js');

const verifications = [
  {
    row: 557, // Alpha Partners - Steve Brotman
    notes: 'Email steve@alphapartners.com verified via alphapartners.com team page. Managing Partner and Founder. Note: VC firm focused on venture partnerships. (2026-03-25 cron)',
    status: 'Enriched'
  },
  {
    row: 571, // Betcher Financial Group - Joe Betcher
    notes: 'Email joeb@betchergroup.com verified via betcherfg.com. However, this is a financial advisory/wealth management firm, not a PE investor. (2026-03-25 cron)',
    status: 'Dead - Not PE Firm'
  },
  {
    row: 545, // Sydecar - Nik Talreja
    notes: 'Email nik@sydecar.io verified via sydecar.io press page. Note: Sydecar is a SaaS platform for SPV/fund administration, not a PE investor. (2026-03-25 cron)',
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
