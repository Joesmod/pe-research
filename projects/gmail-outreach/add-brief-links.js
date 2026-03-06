const { google } = require('googleapis');

async function addBriefLinks() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'sheets-service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Read current Sheet1 data
  console.log('Reading Sheet1...');
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:Z',
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  console.log(`Found ${rows.length} rows`);
  console.log('Headers:', rows[0]);
  
  // Find "Company" column (should be column A)
  const headers = rows[0];
  const companyColIdx = headers.findIndex(h => h && h.toLowerCase().includes('company'));
  
  if (companyColIdx === -1) {
    console.error('Could not find Company column');
    return;
  }
  
  console.log(`Company column found at index ${companyColIdx}`);
  
  // Find Charlesbank and Knox Lane rows
  let charlesbankRow = -1;
  let knoxLaneRow = -1;
  
  rows.forEach((row, idx) => {
    if (idx === 0) return; // skip header
    const company = row[companyColIdx] || '';
    if (company.toLowerCase().includes('charlesbank')) {
      charlesbankRow = idx;
    }
    if (company.toLowerCase().includes('knox lane')) {
      knoxLaneRow = idx;
    }
  });
  
  console.log(`Charlesbank row: ${charlesbankRow + 1}`);
  console.log(`Knox Lane row: ${knoxLaneRow + 1}`);
  
  if (charlesbankRow === -1 || knoxLaneRow === -1) {
    console.error('Could not find both companies');
    return;
  }
  
  // Add "Brief" column if it doesn't exist
  const briefColIdx = headers.findIndex(h => h && h.toLowerCase() === 'brief');
  let newBriefCol;
  
  if (briefColIdx === -1) {
    // Add new column after last existing column
    newBriefCol = headers.length;
    console.log(`Adding new "Brief" column at index ${newBriefCol}`);
    
    // Update header row
    const headerRange = `Sheet1!${String.fromCharCode(65 + newBriefCol)}1`;
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
    console.log(`Using existing "Brief" column at index ${briefColIdx}`);
  }
  
  // GitHub URLs for briefs
  const charlesbankUrl = 'https://github.com/Joesmod/pe-research/blob/master/meeting-briefs/charlesbank-meeting-brief.md';
  const knoxLaneUrl = 'https://github.com/Joesmod/pe-research/blob/master/meeting-briefs/knox-lane-meeting-brief.md';
  
  // Update Charlesbank row
  const charlesbankRange = `Sheet1!${String.fromCharCode(65 + newBriefCol)}${charlesbankRow + 1}`;
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: charlesbankRange,
    valueInputOption: 'USER_ENTERED', // Allow link formatting
    resource: {
      values: [[charlesbankUrl]],
    },
  });
  console.log(`✅ Added Charlesbank brief link at ${charlesbankRange}`);
  
  // Update Knox Lane row
  const knoxLaneRange = `Sheet1!${String.fromCharCode(65 + newBriefCol)}${knoxLaneRow + 1}`;
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: knoxLaneRange,
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [[knoxLaneUrl]],
    },
  });
  console.log(`✅ Added Knox Lane brief link at ${knoxLaneRange}`);
  
  console.log('\n✅ Done! Brief links added to tracker.');
}

addBriefLinks().catch(console.error);
