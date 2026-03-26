const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = 'service-account.json';

async function markDeadFirms() {
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
  
  // Define non-PE firms to mark as dead
  const deadFirms = [
    { name: 'Spectrum Search Partners', reason: 'Dead - Not PE Firm', notes: 'Executive search/recruiting firm' },
    { name: 'Amity Search Partners', reason: 'Dead - Not PE Firm', notes: 'Executive search firm for PE clients' },
    { name: 'Provident Healthcare Partners', reason: 'Dead - Investment Bank', notes: 'Healthcare M&A advisory/IB' },
    { name: 'AGC Partners', reason: 'Dead - Investment Bank', notes: 'Tech M&A advisory firm' },
    { name: 'HSP - Henkel Search Partners', reason: 'Dead - Not PE Firm', notes: 'Executive search firm' },
    { name: 'Jett Capital Advisors', reason: 'Dead - Not PE Firm', notes: 'Capital advisory firm' },
    { name: 'Odyssey Search Partners', reason: 'Dead - Not PE Firm', notes: 'Executive search firm' },
    { name: 'Atlantic Street Capital Advisors, Inc.', reason: 'Dead - Not PE Firm', notes: 'Capital advisory firm' },
    { name: 'Dynamics Search Partners', reason: 'Dead - Not PE Firm', notes: 'Executive search firm' },
    { name: 'Ascension Advisory', reason: 'Dead - Not PE Firm', notes: 'Advisory firm' }
  ];
  
  const updates = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    
    const deadMatch = deadFirms.find(df => company.includes(df.name) || df.name.includes(company));
    
    if (deadMatch) {
      const rowNum = i + 1;
      const currentStatus = row[9] || '';
      const currentNotes = row[11] || '';
      
      // Only update if not already marked as dead
      if (!currentStatus.includes('Dead')) {
        // Update Status column (J = column 9)
        updates.push({
          range: `Sheet1!J${rowNum}`,
          values: [[deadMatch.reason]]
        });
        
        // Update Notes column (L = column 11)
        const newNotes = currentNotes ? `${currentNotes}; ${deadMatch.notes}` : deadMatch.notes;
        updates.push({
          range: `Sheet1!L${rowNum}`,
          values: [[newNotes]]
        });
        
        console.log(`✓ Marked dead: ${company} (row ${rowNum}) - ${deadMatch.reason}`);
      } else {
        console.log(`⊘ Already dead: ${company} (row ${rowNum})`);
      }
    }
  }

  // Apply all updates
  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: updates
      }
    });
    
    console.log(`\n✅ Applied ${updates.length} updates to mark non-PE firms as Dead`);
  } else {
    console.log('\n⚠ No updates needed (firms already marked or not found)');
  }
}

markDeadFirms().catch(console.error);
