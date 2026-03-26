const {readSheet} = require('./sheet.js');

async function main() {
  const r = await readSheet();
  
  const needsWork = r.data.filter(d => {
    const email = (d.values[4] || '').trim();
    const contact = (d.values[2] || '').trim();
    const status = (d.values[9] || '').toLowerCase();
    
    return status !== 'dead - not pe firm' && 
           status !== 'enriched' && 
           (!contact || !email || 
            email.startsWith('info@') || 
            email.startsWith('sales@') || 
            email.startsWith('ir@') ||
            email.includes('@saadbashir.com')); // Personal email, not company
  }).slice(0, 20);
  
  console.log(`Found ${needsWork.length} rows needing enrichment:\n`);
  
  needsWork.forEach(row => {
    console.log(`Row ${row.rowIndex}: ${row.values[0]}`);
    console.log(`  Contact: ${row.values[2] || 'EMPTY'}`);
    console.log(`  Title: ${row.values[3] || 'EMPTY'}`);
    console.log(`  Email: ${row.values[4] || 'EMPTY'}`);
    console.log(`  Status: ${row.values[9]}`);
    console.log('');
  });
}

main().catch(console.error);
