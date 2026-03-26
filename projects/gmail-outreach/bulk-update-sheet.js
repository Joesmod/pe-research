const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');

async function main() {
  try {
    // Load updates
    const updatesFile = process.argv[2] || 'sheet-updates-2026-03-17.json';
    const updates = JSON.parse(fs.readFileSync(updatesFile, 'utf8'));
    
    console.log(`Loading ${updates.length} updates from ${updatesFile}...`);

    // Authenticate
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_FILE,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // First, read the current sheet to find the correct rows by firm name
    console.log('Reading current sheet data...');
    const readResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:M', // Adjust range as needed
    });

    const rows = readResponse.data.values || [];
    const headers = rows[0];
    
    // Find column indexes
    const firmCol = headers.indexOf('Firm Name');
    const websiteCol = headers.indexOf('Website');
    const contactCol = headers.indexOf('Contact Name');
    const titleCol = headers.indexOf('Title');
    const emailCol = headers.indexOf('Email');
    const phoneCol = headers.indexOf('Phone/LinkedIn');
    const sectorsCol = headers.indexOf('Sectors/Focus');
    const statusCol = headers.indexOf('Status');
    const notesCol = headers.indexOf('Notes');

    console.log(`Column mapping: Firm=${firmCol}, Contact=${contactCol}, Email=${emailCol}, Status=${statusCol}`);

    // Prepare batch updates
    const batchUpdates = [];
    let updateCount = 0;

    for (const update of updates) {
      // Find the row for this firm
      let targetRow = -1;
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][firmCol] && rows[i][firmCol].toLowerCase() === update.firm.toLowerCase()) {
          targetRow = i;
          break;
        }
      }

      if (targetRow === -1) {
        console.log(`⚠️  Firm not found: ${update.firm}`);
        continue;
      }

      const rowNumber = targetRow + 1; // 1-indexed for sheets
      console.log(`✓ Found ${update.firm} at row ${rowNumber}`);

      // Build the update data
      const updateData = [];
      
      if (websiteCol >= 0 && update.website) {
        updateData.push({
          range: `Sheet1!${getColumnLetter(websiteCol)}${rowNumber}`,
          values: [[update.website]]
        });
      }
      
      if (contactCol >= 0 && update.contact) {
        updateData.push({
          range: `Sheet1!${getColumnLetter(contactCol)}${rowNumber}`,
          values: [[update.contact]]
        });
      }
      
      if (titleCol >= 0 && update.title) {
        updateData.push({
          range: `Sheet1!${getColumnLetter(titleCol)}${rowNumber}`,
          values: [[update.title]]
        });
      }
      
      if (emailCol >= 0 && update.email) {
        updateData.push({
          range: `Sheet1!${getColumnLetter(emailCol)}${rowNumber}`,
          values: [[update.email]]
        });
      }
      
      if (phoneCol >= 0 && (update.phone || update.linkedin)) {
        const phoneLinkedin = [update.phone, update.linkedin].filter(Boolean).join(' | ');
        updateData.push({
          range: `Sheet1!${getColumnLetter(phoneCol)}${rowNumber}`,
          values: [[phoneLinkedin]]
        });
      }
      
      if (sectorsCol >= 0 && update.sectors) {
        updateData.push({
          range: `Sheet1!${getColumnLetter(sectorsCol)}${rowNumber}`,
          values: [[update.sectors]]
        });
      }
      
      if (statusCol >= 0 && update.status) {
        updateData.push({
          range: `Sheet1!${getColumnLetter(statusCol)}${rowNumber}`,
          values: [[update.status]]
        });
      }
      
      if (notesCol >= 0 && update.notes) {
        // Append to existing notes if any
        const existingNotes = rows[targetRow][notesCol] || '';
        const newNotes = existingNotes ? `${existingNotes}; ${update.notes}` : update.notes;
        updateData.push({
          range: `Sheet1!${getColumnLetter(notesCol)}${rowNumber}`,
          values: [[newNotes]]
        });
      }

      batchUpdates.push(...updateData);
      updateCount++;
    }

    // Execute batch update
    if (batchUpdates.length > 0) {
      console.log(`\nExecuting ${batchUpdates.length} cell updates for ${updateCount} firms...`);
      
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          valueInputOption: 'RAW',
          data: batchUpdates,
        },
      });

      console.log(`✅ Successfully updated ${updateCount} firms in the Google Sheet!`);
    } else {
      console.log('⚠️  No updates to perform.');
    }

  } catch (error) {
    console.error('Error updating sheet:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

function getColumnLetter(colIndex) {
  let letter = '';
  while (colIndex >= 0) {
    letter = String.fromCharCode((colIndex % 26) + 65) + letter;
    colIndex = Math.floor(colIndex / 26) - 1;
  }
  return letter;
}

main();
