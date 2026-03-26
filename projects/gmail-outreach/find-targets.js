const {readSheet} = require('./sheet.js');

(async () => {
  const {headers, data} = await readSheet();
  
  const urlIdx = headers.findIndex(h => h && h.toLowerCase().includes('url'));
  const statusIdx = headers.findIndex(h => h && h.toLowerCase().includes('status'));
  const contactIdx = headers.findIndex(h => h && h.toLowerCase().includes('contact'));
  const companyIdx = headers.findIndex(h => h && h.toLowerCase().includes('company'));
  
  const needsEnrich = data.filter(r => {
    const url = r.values[urlIdx] || '';
    const st = (r.values[statusIdx] || '').toLowerCase();
    const contact = r.values[contactIdx] || '';
    return url.includes('http') && st !== 'enriched' && st !== 'sent' && !contact;
  });
  
  console.log('Rows with URLs needing enrichment:');
  needsEnrich.slice(0, 30).forEach(r => {
    console.log(`Row ${r.rowIndex}: ${r.values[companyIdx]} | ${r.values[urlIdx]}`);
  });
})();
