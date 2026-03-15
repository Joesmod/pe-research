const { google } = require('googleapis');

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Get the current data first to find the right rows
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:J',
  });
  
  const rows = response.data.values;
  const updates = [];
  
  // Find and update Thoma Bravo
  rows.forEach((row, index) => {
    const rowNum = index + 1;
    const companyName = row[0] || '';
    
    // Thoma Bravo
    if (companyName.includes('Thoma Bravo')) {
      updates.push({
        range: `Sheet1!C${rowNum}:H${rowNum}`,
        values: [[
          'Megan Frank',
          'Communications Contact',
          'mfrank@thomabravo.com',
          'https://www.linkedin.com/company/thoma-bravo',
          'Enriched',
          'Official contact from PRNewswire (June 2025). Phone: 212.731.4778. PR agency: thomabravo@fgsglobal.com'
        ]]
      });
    }
  });
  
  // Add new mid-market PE firms
  const lastRow = rows.length + 1;
  
  const newFirms = [
    [
      'Trivest Partners',
      'https://trivest.com',
      '',
      '',
      'info@trivest.com',
      '',
      'New Lead',
      'Mid-market PE, ~$3B AUM, focus on B2B services. Miami-based. Source: trivest.com research 2026-03-13'
    ],
    [
      'Blackford Capital',
      'https://blackfordcapital.com',
      '',
      '',
      '',
      '',
      'New Lead',
      'Mid-market PE, ~$2B+ AUM, business services focus. Grand Rapids, MI. Source: blackfordcapital.com research 2026-03-13'
    ],
    [
      'CenterOak Partners',
      'https://centeroakpartners.com',
      '',
      '',
      'info@centeroakpartners.com',
      '',
      'New Lead',
      'Mid-market PE, ~$1B+ AUM, business/consumer services. Dallas-based. Source: centeroakpartners.com research 2026-03-13'
    ],
    [
      'InterMedia Partners',
      'https://intermediapartners.com',
      '',
      '',
      '',
      '',
      'New Lead',
      'Mid-market PE, ~$3B AUM, media & communications services. San Francisco/Houston. Source: intermediapartners.com research 2026-03-13'
    ],
    [
      'Resilience Capital Partners',
      'https://resiliencecapital.com',
      '',
      '',
      'info@resiliencecapital.com',
      '',
      'New Lead',
      'Mid-market PE, ~$1.5B AUM, manufacturing/services. Cleveland-based. Source: resiliencecapital.com research 2026-03-13'
    ]
  ];
  
  // Append new firms
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Sheet1!A:H',
    valueInputOption: 'RAW',
    requestBody: {
      values: newFirms
    }
  });
  
  console.log(`Added ${newFirms.length} new PE firms to the sheet.`);
  
  // Batch update existing firms
  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
    console.log(`Updated ${updates.length} existing firms in the sheet.`);
  }
}

updateSheet().catch(console.error);
