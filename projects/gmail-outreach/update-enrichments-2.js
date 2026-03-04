const { google } = require('googleapis');

async function updateEnrichments() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Read current data to find row numbers
  const readResponse = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:K',
  });
  
  const rows = readResponse.data.values;
  const updates = [];
  
  // Helper function to find row by firm name
  function findRowByFirm(firmName) {
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] && rows[i][0].toLowerCase().includes(firmName.toLowerCase())) {
        return i + 1; // 1-indexed for sheets
      }
    }
    return null;
  }
  
  // NEW enrichment data (batch 2)
  const enrichments = [
    {
      firm: 'Brightwood Capital',
      contact: 'Scott Porter',
      title: 'Managing Director',
      email: 'porter@brightwoodlp.com',
      linkedin: 'https://www.linkedin.com/company/brightwood-capital-advisors',
      status: 'Enriched',
      notes: 'Source: brightwoodlp.com team page'
    },
    {
      firm: 'Kinderhook Industries',
      contact: 'Robert Michalik',
      title: 'Managing Director',
      email: '[email protected]',
      linkedin: 'https://www.linkedin.com/company/kinderhookindustries',
      status: 'Enriched',
      notes: 'Source: kinderhook.com press release (verified)'
    }
  ];
  
  // Build update requests
  for (const enrich of enrichments) {
    const row = findRowByFirm(enrich.firm);
    if (!row) {
      console.log(`Firm not found: ${enrich.firm}`);
      continue;
    }
    
    console.log(`Updating ${enrich.firm} at row ${row}`);
    
    // Columns: A=Firm, B=Contact, C=Title, D=Email, E=Website, F=LinkedIn, G=Sector, H=Description, I=Status, J=Notes
    
    if (enrich.contact) {
      updates.push({
        range: `Sheet1!B${row}`,
        values: [[enrich.contact]]
      });
    }
    
    if (enrich.title) {
      updates.push({
        range: `Sheet1!C${row}`,
        values: [[enrich.title]]
      });
    }
    
    if (enrich.email) {
      updates.push({
        range: `Sheet1!D${row}`,
        values: [[enrich.email]]
      });
    }
    
    if (enrich.linkedin) {
      updates.push({
        range: `Sheet1!F${row}`,
        values: [[enrich.linkedin]]
      });
    }
    
    if (enrich.status) {
      updates.push({
        range: `Sheet1!I${row}`,
        values: [[enrich.status]]
      });
    }
    
    if (enrich.notes) {
      // Append to existing notes if any
      const existingNotes = rows[row - 1][9] || '';
      const newNotes = existingNotes ? `${existingNotes}; ${enrich.notes}` : enrich.notes;
      updates.push({
        range: `Sheet1!J${row}`,
        values: [[newNotes]]
      });
    }
  }
  
  // Execute batch update
  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
    console.log(`\n✅ Updated ${updates.length} cells for ${enrichments.length} firms`);
  } else {
    console.log('No updates to apply');
  }
  
  // Print summary
  console.log('\n📊 Enrichment Summary (Batch 2):');
  enrichments.forEach(e => {
    console.log(`  • ${e.firm}: ${e.contact} (${e.title}) - ${e.email}`);
  });
}

updateEnrichments().catch(console.error);
