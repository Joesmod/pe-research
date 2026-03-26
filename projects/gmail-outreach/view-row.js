const {readSheet} = require('./sheet.js');

(async () => {
  const rowNum = parseInt(process.argv[2]) || 853;
  const {headers, data} = await readSheet();
  const row = data.find(r => r.rowIndex === rowNum);
  
  if (row) {
    console.log(`Row ${rowNum} current values:\n`);
    headers.forEach((h, i) => {
      console.log(`${i}. ${h}: ${row.values[i] || '(empty)'}`);
    });
  } else {
    console.log(`Row ${rowNum} not found`);
  }
})();
