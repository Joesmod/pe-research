const { google } = require('googleapis');

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // First, read the sheet to find the right rows
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:L',
  });
  
  const rows = result.data.values;
  const updates = [];
  const today = new Date().toISOString().split('T')[0];
  
  // Find and update rows
  rows.forEach((row, index) => {
    const company = row[0] || '';
    const rowNum = index + 1;
    
    // Roebling Capital Partners
    if (company.includes('Roebling Capital')) {
      updates.push({
        range: 'Sheet1!C' + rowNum + ':L' + rowNum,
        values: [['Keith Carlson', 'CEO & Managing Partner', 'KCarlson@RCPprivateequity.com', 'https://roeblingcp.com', 'https://www.linkedin.com/company/roebling-capital-partners', '', '', 'Enriched', today, 'Verified email from company website contact page']]
      });
    }
    
    // Silver Oak Services Partners
    if (company.includes('Silver Oak Services')) {
      updates.push({
        range: 'Sheet1!C' + rowNum + ':L' + rowNum,
        values: [['Greg Barr', 'Managing Partner', 'gbarr@silveroaksp.com', 'https://www.silveroaksp.com', 'https://www.linkedin.com/company/silver-oak-services-partners', '', '', 'Enriched', today, 'Verified from press releases. Also David Friedman: dfriedman@silveroaksp.com']]
      });
    }
    
    // Palladium Equity Partners
    if (company.includes('Palladium Equity')) {
      updates.push({
        range: 'Sheet1!C' + rowNum + ':L' + rowNum,
        values: [['Erick Bronner', 'MD of Fundraising & IR', 'ebronner@palladiumequity.com', 'https://www.palladiumequity.com', 'https://www.linkedin.com/company/palladium-equity-partners', '', '', 'Enriched', today, 'Verified from press releases. Also Deborah Gallegos (MD): dgallegos@palladiumequity.com']]
      });
    }
    
    // Gauge Capital
    if (company.includes('Gauge Capital')) {
      updates.push({
        range: 'Sheet1!C' + rowNum + ':L' + rowNum,
        values: [['Andrew Peix', 'Partner, Business Development', 'apeix@gaugecapital.com', 'https://gaugecapital.com', 'https://www.linkedin.com/company/gauge-capital', '', '', 'Enriched', today, 'Verified from Jan 2026 press release']]
      });
    }
    
    // Sverica Capital
    if (company.includes('Sverica Capital')) {
      updates.push({
        range: 'Sheet1!C' + rowNum + ':L' + rowNum,
        values: [['Nathalie Allen', 'Media Contact', 'nathalie@sverica.com', 'https://sverica.com', 'https://www.linkedin.com/company/sverica-capital', '', '', 'Enriched', today, 'Media contact verified from press releases. Jordan Richards is Managing Partner']]
      });
    }
  });
  
  // Execute updates
  if (updates.length > 0) {
    for (const update of updates) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: update.range,
        valueInputOption: 'RAW',
        resource: { values: update.values }
      });
    }
    console.log('Updated ' + updates.length + ' rows');
    console.log('Firms enriched:');
    updates.forEach(u => console.log('  - ' + u.values[0][0] + ' at ' + u.values[0][1]));
  } else {
    console.log('No matching rows found to update');
  }
}

updateSheet().catch(console.error);
