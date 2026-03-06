const { google } = require('googleapis');

async function addBriefsToTracker() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'sheets-service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Read Tracker tab
  console.log('Reading Tracker tab...');
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Tracker!A:Z',
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found in Tracker tab.');
    return;
  }
  
  console.log(`Found ${rows.length} rows in Tracker`);
  console.log('Headers:', rows[0]);
  
  // Find Company column
  const headers = rows[0];
  const companyColIdx = headers.findIndex(h => h && h.toLowerCase().includes('company'));
  
  if (companyColIdx === -1) {
    console.error('Could not find Company column in Tracker');
    return;
  }
  
  console.log(`Company column at index ${companyColIdx}`);
  
  // Find Charlesbank and Knox Lane rows
  let charlesbankRow = -1;
  let knoxLaneRow = -1;
  
  rows.forEach((row, idx) => {
    if (idx === 0) return; // skip header
    const company = (row[companyColIdx] || '').toLowerCase();
    if (company.includes('charlesbank')) {
      charlesbankRow = idx;
      console.log(`Found Charlesbank at row ${idx + 1}: "${row[companyColIdx]}"`);
    }
    if (company.includes('knox') && company.includes('lane')) {
      knoxLaneRow = idx;
      console.log(`Found Knox Lane at row ${idx + 1}: "${row[companyColIdx]}"`);
    }
  });
  
  if (charlesbankRow === -1 && knoxLaneRow === -1) {
    console.log('\n⚠️ Neither company found in Tracker. They may need to be added first.');
    console.log('Companies in Tracker:');
    rows.slice(1, 10).forEach((row, idx) => {
      console.log(`  Row ${idx + 2}: "${row[companyColIdx] || '(empty)'}"`);
    });
    return;
  }
  
  // Check if "Brief" column exists
  const briefColIdx = headers.findIndex(h => h && h.toLowerCase() === 'brief');
  let newBriefCol;
  
  if (briefColIdx === -1) {
    // Add new column
    newBriefCol = headers.length;
    console.log(`\nAdding new "Brief" column at index ${newBriefCol}`);
    
    const headerRange = `Tracker!${String.fromCharCode(65 + newBriefCol)}1`;
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: headerRange,
      valueInputOption: 'RAW',
      resource: {
        values: [['Brief']],
      },
    });
  } else {
    newBriefCol = briefColIdx;
    console.log(`\nUsing existing "Brief" column at index ${briefColIdx}`);
  }
  
  // GitHub URLs
  const charlesbankUrl = 'https://github.com/Joesmod/pe-research/blob/master/meeting-briefs/charlesbank-meeting-brief.md';
  const knoxLaneUrl = 'https://github.com/Joesmod/pe-research/blob/master/meeting-briefs/knox-lane-meeting-brief.md';
  
  // Update Charlesbank if found
  if (charlesbankRow !== -1) {
    const range = `Tracker!${String.fromCharCode(65 + newBriefCol)}${charlesbankRow + 1}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[charlesbankUrl]],
      },
    });
    console.log(`✅ Added Charlesbank brief at ${range}`);
  }
  
  // Update Knox Lane if found
  if (knoxLaneRow !== -1) {
    const range = `Tracker!${String.fromCharCode(65 + newBriefCol)}${knoxLaneRow + 1}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[knoxLaneUrl]],
      },
    });
    console.log(`✅ Added Knox Lane brief at ${range}`);
  }
  
  console.log('\n✅ Done! Brief links added to Tracker tab.');
}

addBriefsToTracker().catch(console.error);
