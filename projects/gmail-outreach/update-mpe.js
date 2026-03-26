const {readSheet, updateRow} = require('./sheet.js');

async function updateMPE() {
  const {headers, data} = await readSheet();
  console.log('Headers:', headers);
  
  // Find row 1161
  const row = data.find(d => d.rowIndex === 1161);
  if (!row) {
    console.log('Row 1161 not found');
    return;
  }
  
  console.log('\nCurrent row 1161:', row.values);
  
  // Update with new values
  const updated = [...row.values];
  updated[2] = 'Peter Taft';  // Contact Name
  updated[3] = 'Partner (founding)';  // Title
  updated[4] = 'ptaft@mpepartners.com';  // Email
  updated[5] = 'https://www.mpepartners.com';  // URL (if not set)
  updated[6] = 'https://www.linkedin.com/in/peter-taft-5651824/';  // LinkedIn
  updated[9] = 'Enriched - 2026-03-16';  // Status
  updated[11] = 'Email verified from MPE Partners official factsheet PDF. Founded 1968 as Morgenthaler, rebranded MPE Partners 2012. Lower middle market LBOs, recaps. Cleveland & Boston offices. Focus: high-value manufacturing & commercial/industrial services. Peter Taft joined 1987, co-founded MPE 2012 with Joe Machado and Karen Tuleta.';  // Notes
  
  console.log('\nUpdated row:', updated);
  
  await updateRow(1161, updated);
  console.log('\nRow 1161 updated successfully');
}

updateMPE().catch(console.error);
