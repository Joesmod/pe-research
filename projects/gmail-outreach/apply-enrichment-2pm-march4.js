const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = './service-account.json';

async function main() {
  // Load enrichment data
  const enrichments = JSON.parse(fs.readFileSync('./update-march4-2pm.json', 'utf8'));
  
  // Auth
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  // Read current sheet
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:L',
  });
  const rows = response.data.values || [];
  const headers = rows[0];
  
  // Column indexes
  const companyIdx = headers.indexOf('Company');
  const contactIdx = headers.indexOf('Contact Name');
  const titleIdx = headers.indexOf('Position/Title');
  const emailIdx = headers.indexOf('Email');
  const linkedInIdx = headers.indexOf('LinkedIn');
  const statusIdx = headers.indexOf('Status');
  const notesIdx = headers.indexOf('Notes');

  console.log('Found', rows.length, 'rows in sheet');
  console.log('Processing', enrichments.length, 'enrichments');

  const updates = [];
  
  for (const enrichment of enrichments) {
    // Find matching row
    const rowIndex = rows.findIndex((row, idx) => 
      idx > 0 && row[companyIdx] === enrichment.company
    );
    
    if (rowIndex === -1) {
      console.log('❌ Company not found:', enrichment.company);
      continue;
    }
    
    const row = rows[rowIndex];
    const rowNum = rowIndex + 1;
    
    console.log(`\n📝 Updating row ${rowNum}: ${enrichment.company}`);
    
    // Build updates
    const rowUpdates = [];
    
    // Update Contact Name if we have one and current is empty
    if (enrichment.contactName && (!row[contactIdx] || row[contactIdx].trim() === '')) {
      rowUpdates.push({
        range: `Sheet1!${String.fromCharCode(65 + contactIdx)}${rowNum}`,
        values: [[enrichment.contactName]]
      });
      console.log('  ✅ Contact Name:', enrichment.contactName);
    }
    
    // Update Title if we have one and current is empty
    if (enrichment.title && (!row[titleIdx] || row[titleIdx].trim() === '')) {
      rowUpdates.push({
        range: `Sheet1!${String.fromCharCode(65 + titleIdx)}${rowNum}`,
        values: [[enrichment.title]]
      });
      console.log('  ✅ Title:', enrichment.title);
    }
    
    // Update Email if we have one and current is empty/generic
    const currentEmail = row[emailIdx] || '';
    const isGeneric = /^(info|contact|sales|ir|admin)@/.test(currentEmail);
    if (enrichment.email && (currentEmail.trim() === '' || isGeneric)) {
      rowUpdates.push({
        range: `Sheet1!${String.fromCharCode(65 + emailIdx)}${rowNum}`,
        values: [[enrichment.email]]
      });
      console.log('  ✅ Email:', enrichment.email);
    }
    
    // Update LinkedIn if we have one and current is empty
    if (enrichment.linkedIn && (!row[linkedInIdx] || row[linkedInIdx].trim() === '')) {
      rowUpdates.push({
        range: `Sheet1!${String.fromCharCode(65 + linkedInIdx)}${rowNum}`,
        values: [[enrichment.linkedIn]]
      });
      console.log('  ✅ LinkedIn:', enrichment.linkedIn);
    }
    
    // Update Status
    if (enrichment.status) {
      rowUpdates.push({
        range: `Sheet1!${String.fromCharCode(65 + statusIdx)}${rowNum}`,
        values: [[enrichment.status]]
      });
      console.log('  ✅ Status:', enrichment.status);
    }
    
    // Append to Notes
    const currentNotes = row[notesIdx] || '';
    const newNote = `[${new Date().toISOString().split('T')[0]}] ${enrichment.notes} Source: ${enrichment.source}`;
    const updatedNotes = currentNotes ? `${currentNotes}\n${newNote}` : newNote;
    rowUpdates.push({
      range: `Sheet1!${String.fromCharCode(65 + notesIdx)}${rowNum}`,
      values: [[updatedNotes]]
    });
    console.log('  ✅ Notes appended');
    
    updates.push(...rowUpdates);
  }

  // Batch update
  if (updates.length > 0) {
    console.log(`\n🚀 Applying ${updates.length} updates to sheet...`);
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: updates,
      },
    });
    console.log('✅ Sheet updated successfully!');
  } else {
    console.log('⚠️  No updates to apply');
  }
}

main().catch(console.error);
