const { google } = require('googleapis');

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Read current sheet to find row numbers
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:I',
  });
  
  const rows = res.data.values;
  const updates = [];
  
  // Find and update rows
  for (let i = 0; i < rows.length; i++) {
    const firmName = rows[i][0];
    const contactName = rows[i][2] || '';
    
    // Pathway Capital Management - Bryan Nelson
    if (firmName === 'Pathway Capital Management' && contactName.includes('Bryan')) {
      updates.push({
        range: `Sheet1!D${i+1}`,
        values: [['bnelson@pathwaycapital.com']]
      });
      updates.push({
        range: `Sheet1!I${i+1}`,
        values: [['Enriched']]
      });
      updates.push({
        range: `Sheet1!H${i+1}`,
        values: [['Found via team page and RocketReach pattern match']]
      });
      console.log(`Found Pathway Capital Management at row ${i+1}`);
    }
    
    // Ridgemont Equity Partners - Add John Shimp
    if (firmName === 'Ridgemont Equity Partners') {
      updates.push({
        range: `Sheet1!B${i+1}:E${i+1}`,
        values: [['John Shimp', 'Managing Partner', 'jshipm@ridgemontep.com', 'https://www.linkedin.com/in/john-shimp-91a73927/']]
      });
      updates.push({
        range: `Sheet1!I${i+1}`,
        values: [['Enriched']]
      });
      updates.push({
        range: `Sheet1!H${i+1}`,
        values: [['Found via RocketReach; email pattern FLast@ridgemontep.com']]
      });
      console.log(`Found Ridgemont Equity Partners at row ${i+1}`);
    }
    
    // TowerBrook Capital Partners - Add Karim Saddi
    if (firmName === 'TowerBrook Capital Partners') {
      updates.push({
        range: `Sheet1!B${i+1}:E${i+1}`,
        values: [['Karim Saddi', 'Co-CEO & Managing Partner', 'ksaddi@towerbrook.com', 'https://www.linkedin.com/in/karim-saddi-455067173/']]
      });
      updates.push({
        range: `Sheet1!I${i+1}`,
        values: [['Enriched']]
      });
      updates.push({
        range: `Sheet1!H${i+1}`,
        values: [['Found via RocketReach pattern match']]
      });
      console.log(`Found TowerBrook Capital Partners at row ${i+1}`);
    }
    
    // Graycliff Partners - Add Stephen Hindmarch email
    if (firmName === 'Graycliff Partners') {
      updates.push({
        range: `Sheet1!D${i+1}`,
        values: [['shindmarch@graycliffpartners.com']]
      });
      updates.push({
        range: `Sheet1!I${i+1}`,
        values: [['Enriched']]
      });
      updates.push({
        range: `Sheet1!H${i+1}`,
        values: [['Email found via ContactOut']]
      });
      console.log(`Found Graycliff Partners at row ${i+1}`);
    }
    
    // Hunter Point Capital - Add Avshalom Kalichstein
    if (firmName === 'Hunter Point Capital') {
      updates.push({
        range: `Sheet1!B${i+1}:E${i+1}`,
        values: [['Avshalom Kalichstein', 'CEO & Co-Founder', 'akalichstein@hunterpointcapital.com', 'https://www.linkedin.com/company/hunterpointcapital/']]
      });
      updates.push({
        range: `Sheet1!I${i+1}`,
        values: [['Enriched']]
      });
      updates.push({
        range: `Sheet1!H${i+1}`,
        values: [['CEO found via company website']]
      });
      console.log(`Found Hunter Point Capital at row ${i+1}`);
    }
  }
  
  // Batch update
  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        data: updates,
        valueInputOption: 'RAW',
      },
    });
    console.log(`\nSuccessfully updated ${updates.length} cells`);
  } else {
    console.log('No updates found');
  }
}

updateSheet().catch(console.error);
