const {readSheet} = require('./sheet.js');

async function main() {
  const searchTerms = process.argv.slice(2);
  const {data} = await readSheet();
  
  const matches = data.filter(d => {
    const company = (d.values[0] || '').toLowerCase();
    return searchTerms.some(term => company.includes(term.toLowerCase()));
  });
  
  console.log(`Found ${matches.length} matching firms:\n`);
  matches.forEach(f => {
    console.log(`Row ${f.rowIndex}: ${f.values[0]}`);
    console.log(`  Contact: ${f.values[2] || 'EMPTY'}`);
    console.log(`  Email: ${f.values[4] || 'EMPTY'}`);
    console.log(`  Status: ${f.values[9]}`);
    console.log('');
  });
}

main().catch(console.error);
