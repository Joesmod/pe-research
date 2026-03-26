const {readSheet} = require('./sheet.js');

async function main() {
  const {data} = await readSheet();
  const rows = [539, 549, 547];
  
  rows.forEach(rowNum => {
    const row = data.find(d => d.rowIndex === rowNum);
    if (row) {
      console.log(`Row ${rowNum}: ${row.values[0]}`);
      console.log(`  Contact: ${row.values[2]}`);
      console.log(`  Email: ${row.values[4]}`);
      console.log(`  LinkedIn: ${row.values[5]}`);
      console.log('');
    }
  });
}

main().catch(console.error);
