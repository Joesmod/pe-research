const { google } = require('googleapis');

async function updateSheet() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
    
    // Prepare updates for verified enrichment
    const updates = [];
    
    // Row 4 - Thesis Capital Partners - Ian J.H. Reynolds
    updates.push({
      range: 'Sheet1!C4',  // Contact Name
      values: [['Ian J.H. Reynolds']]
    });
    updates.push({
      range: 'Sheet1!D4',  // Title
      values: [['Partner']]
    });
    updates.push({
      range: 'Sheet1!E4',  // Email
      values: [['ian@thesiscapital.com']]
    });
    updates.push({
      range: 'Sheet1!G4',  // LinkedIn
      values: [['https://www.linkedin.com/company/thesis-capital']]
    });
    updates.push({
      range: 'Sheet1!J4',  // Status
      values: [['Enriched - Web Research 2026-03-06']]
    });
    
    // Batch update
    const batchUpdateRequest = {
      spreadsheetId,
      resource: {
        valueInputOption: 'RAW',
        data: updates
      }
    };
    
    const response = await sheets.spreadsheets.values.batchUpdate(batchUpdateRequest);
    
    console.log('✅ Successfully updated 1 lead:');
    console.log('   - Row 4: Thesis Capital Partners → Ian J.H. Reynolds (ian@thesiscapital.com)');
    console.log(`\nTotal cells updated: ${response.data.totalUpdatedCells}`);
    
    // Log data quality issue for Row 20
    console.log('\n⚠️  Data Quality Issue Identified:');
    console.log('   - Row 20: Charlesbank Capital Partners');
    console.log('   - Issue: Dominic Ang is at Turn/River Capital, NOT Charlesbank');
    console.log('   - Action: Needs replacement contact from actual Charlesbank roster');
    
  } catch (error) {
    console.error('Error updating sheet:', error.message);
  }
}

updateSheet();
