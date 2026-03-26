const {readSheet} = require('./sheet.js');

(async () => {
  const {headers, data} = await readSheet();
  
  console.log('Column mappings:');
  headers.forEach((h, i) => console.log(`  ${i}: ${h}`));
  
  console.log('\n\nSample rows (first 20):');
  data.slice(0, 20).forEach(row => {
    const company = row.values[0];
    const contact = row.values[2];
    const email = row.values[4];
    const status = row.values[9];
    const url = row.values[12];
    
    console.log(`\nRow ${row.rowIndex}: ${company}`);
    console.log(`  Contact: ${contact || '(empty)'}`);
    console.log(`  Email: ${email || '(empty)'}`);
    console.log(`  Status: ${status || '(empty)'}`);
    console.log(`  URL: ${url || '(empty)'}`);
  });
})();
