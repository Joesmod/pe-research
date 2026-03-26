const { readSheet, updateRow } = require('./sheet.js');

async function enrichRow(rowIndex, contact, title, email, linkedin, notes) {
  const { headers, data } = await readSheet();
  
  const row = data.find(r => r.rowIndex === rowIndex);
  if (!row) {
    console.error(`Row ${rowIndex} not found`);
    return;
  }
  
  // Column mapping
  const headerIdx = {
    company: 0,
    notebookLM: 1,
    contact: 2,
    title: 3,
    email: 4,
    companyUrl: 5,
    linkedin: 6,
    status: 7,
    notes: 8,
  };
  
  // Build updated row, preserving existing values
  const updatedRow = [...row.values];
  while (updatedRow.length < 14) updatedRow.push(''); // Ensure enough columns
  
  updatedRow[headerIdx.contact] = contact;
  updatedRow[headerIdx.title] = title;
  updatedRow[headerIdx.email] = email;
  updatedRow[headerIdx.linkedin] = linkedin;
  updatedRow[headerIdx.status] = 'Enriched';
  updatedRow[headerIdx.notes] = notes;
  
  await updateRow(rowIndex, updatedRow);
  console.log(`✅ Enriched row ${rowIndex}: ${contact} (${title}) - ${email}`);
}

const args = process.argv.slice(2);
if (args.length < 5) {
  console.log('Usage: node enrich-row.js <rowIndex> <contact> <title> <email> <linkedin> [notes]');
  process.exit(1);
}

const [rowIndex, contact, title, email, linkedin, ...notesParts] = args;
const notes = notesParts.join(' ') || 'Enriched via research';

enrichRow(parseInt(rowIndex), contact, title, email, linkedin, notes).catch(console.error);
