const fs = require('fs');

// Read the sheet data
const sheetData = JSON.parse(fs.readFileSync('sheet-data.json', 'utf8'));
const header = sheetData[0];
const rows = sheetData.slice(1);

console.log('\n🔍 SCANNING FOR ENRICHMENT TARGETS\n');
console.log('Criteria: Missing contact OR generic email, AND not already Contacted/Enriched/Dead Lead\n');

const targets = [];

rows.forEach((row, idx) => {
  const company = row[0] || '';
  const contactName = row[1] || '';
  const title = row[2] || '';
  const email = row[3] || '';
  const website = row[4] || '';
  const linkedin = row[5] || '';
  const sectorFocus = row[6] || '';
  const portfolio = row[7] || '';
  const status = row[8] || '';
  
  // Skip if status is one of these
  if (status === 'Contacted' || status === 'Enriched' || status === 'Dead Lead' || status === 'DUPLICATE' || status.includes('Meeting')) {
    return;
  }
  
  // Check if needs enrichment
  const noContact = !contactName || contactName.trim() === '' || contactName === 'Not identified' || contactName === 'N/A';
  const genericEmail = email.match(/^(info|sales|ir|contact|hello|support|admin|deals|media|invest)@/i);
  const noEmail = !email || email.trim() === '';
  
  if (noContact || genericEmail || noEmail) {
    targets.push({
      company,
      contactName: contactName || '(empty)',
      title: title || '(empty)',
      email: email || '(empty)',
      website,
      linkedin,
      status: status || '(empty)',
      rowIndex: idx + 2  // +2 because header is row 1, array is 0-indexed
    });
  }
});

console.log(`Found ${targets.length} firms needing enrichment\n`);

// Take first 15
const priorityTargets = targets.slice(0, 15);

priorityTargets.forEach((t, idx) => {
  console.log(`${idx + 1}. ${t.company}`);
  console.log(`   Contact: ${t.contactName}`);
  console.log(`   Email: ${t.email}`);
  console.log(`   Status: ${t.status}`);
  console.log(`   Website: ${t.website}`);
  console.log(`   Row: ${t.rowIndex}`);
  console.log('');
});

// Save to file
fs.writeFileSync('_enrichment_targets_0336.json', JSON.stringify(priorityTargets, null, 2));
console.log(`✅ ${priorityTargets.length} priority targets saved to _enrichment_targets_0336.json\n`);
