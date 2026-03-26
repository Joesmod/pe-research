const { readSheet, updateRow } = require('./sheet.js');

async function main() {
  const { headers, data } = await readSheet();
  
  const headerIdx = {
    company: headers.findIndex(h => h && h.toLowerCase().includes('company')),
    notebookLM: headers.findIndex(h => h && h.toLowerCase().includes('notebooklm')),
    contact: headers.findIndex(h => h && h.toLowerCase().includes('contact')),
    title: headers.findIndex(h => h && h.toLowerCase().includes('title')),
    email: headers.findIndex(h => h && h.toLowerCase().includes('email')),
    website: headers.findIndex(h => h && h.toLowerCase().includes('website')),
    linkedin: headers.findIndex(h => h && h.toLowerCase().includes('linkedin')),
    status: headers.findIndex(h => h && h.toLowerCase().includes('status')),
    notes: headers.findIndex(h => h && (h.toLowerCase().includes('notes') || h.toLowerCase().includes('last'))),
  };
  
  // Find rows needing enrichment
  const needsEnrichment = data.filter(row => {
    const contact = (row.values[headerIdx.contact] || '').trim();
    const email = (row.values[headerIdx.email] || '').trim();
    const status = (row.values[headerIdx.status] || '').toLowerCase();
    
    const hasNoContact = !contact || contact === '';
    const hasGenericEmail = email && (email.startsWith('info@') || email.startsWith('sales@') || email.startsWith('ir@'));
    const isActive = status !== 'dead' && status !== 'enriched' && status !== 'sent';
    
    return isActive && (hasNoContact || hasGenericEmail);
  });
  
  console.log('Rows needing enrichment:');
  console.log('========================');
  needsEnrichment.slice(0, 30).forEach(row => {
    const company = row.values[headerIdx.company] || '';
    const website = row.values[headerIdx.website] || '';
    const contact = row.values[headerIdx.contact] || '(empty)';
    const email = row.values[headerIdx.email] || '(empty)';
    const status = row.values[headerIdx.status] || '(empty)';
    
    console.log(`\nRow ${row.rowIndex}: ${company}`);
    console.log(`  Website: ${website}`);
    console.log(`  Contact: ${contact}`);
    console.log(`  Email: ${email}`);
    console.log(`  Status: ${status}`);
  });
}

main().catch(console.error);
