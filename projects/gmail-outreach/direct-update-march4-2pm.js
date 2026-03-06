const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: './service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  // Get headers to find column indexes
  const headersRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:Z1',
  });
  const headers = headersRes.data.values[0];
  
  const contactIdx = headers.indexOf('Contact Name');
  const titleIdx = headers.indexOf('Title');
  const emailIdx = headers.indexOf('Email');
  const statusIdx = headers.indexOf('Status');
  const notesIdx = headers.indexOf('Notes');
  
  console.log('Column indexes:', {contactIdx, titleIdx, emailIdx, statusIdx, notesIdx});
  
  const updates = [];
  
  // Update 1: W Capital Partners (row 443)
  console.log('\n✅ Updating W Capital Partners (row 443)');
  updates.push(
    { range: `Sheet1!${String.fromCharCode(65 + contactIdx)}443`, values: [['Katherine Dowley']] },
    { range: `Sheet1!${String.fromCharCode(65 + titleIdx)}443`, values: [['Vice President of Investor Relations']] },
    { range: `Sheet1!${String.fromCharCode(65 + emailIdx)}443`, values: [['kdowley@wcapgroup.com']] },
    { range: `Sheet1!${String.fromCharCode(65 + statusIdx)}443`, values: [['Enriched']] },
    { range: `Sheet1!${String.fromCharCode(65 + notesIdx)}443`, values: [['[2026-03-04] Katherine Dowley VP Investor Relations. Direct email verified. Source: wcapgroup.com/team-members']] }
  );
  
  // Update 2: Kinect Capital (row 630) - Mark as Dead
  console.log('✅ Marking Kinect Capital as Dead (row 630)');
  updates.push(
    { range: `Sheet1!${String.fromCharCode(65 + statusIdx)}630`, values: [['Dead - Accelerator']] },
    { range: `Sheet1!${String.fromCharCode(65 + notesIdx)}630`, values: [['[2026-03-04] Venture accelerator/education org in Utah (founded 1983), not a PE firm.']] }
  );
  
  // Update 3: Alta Park Capital (row 699) - Mark as Dead
  console.log('✅ Marking Alta Park Capital as Dead (row 699)');
  updates.push(
    { range: `Sheet1!${String.fromCharCode(65 + statusIdx)}699`, values: [['Dead - Hedge Fund']] },
    { range: `Sheet1!${String.fromCharCode(65 + notesIdx)}699`, values: [['[2026-03-04] Hedge fund (13F filer), not traditional PE. Connor Joyce CFO. Not target for outreach.']] }
  );

  // Apply batch update
  console.log(`\n🚀 Applying ${updates.length} updates...`);
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      valueInputOption: 'USER_ENTERED',
      data: updates,
    },
  });
  
  console.log('✅ Sheet updated successfully!');
  console.log('\nSummary:');
  console.log('- W Capital Partners: Added Katherine Dowley (kdowley@wcapgroup.com)');
  console.log('- Kinect Capital: Marked as Dead - Accelerator');
  console.log('- Alta Park Capital: Marked as Dead - Hedge Fund');
}

main().catch(console.error);
