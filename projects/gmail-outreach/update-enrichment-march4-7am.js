const { google } = require('googleapis');

async function updateEnrichment() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  const updates = [
    {
      row: 671,
      company: 'Seacoast Capital',
      contactName: 'Jamie Donelan',
      title: 'Partner',
      email: 'jdonelan@seacoastcapital.com',
      linkedin: 'https://www.linkedin.com/in/jamiedonelan/',
      status: 'Enriched',
      notes: 'Email found in official press release (seacoastcapital.com)'
    }
  ];
  
  console.log('Updating Google Sheet with enrichment data...\n');
  
  for (const update of updates) {
    console.log(`Updating Row ${update.row}: ${update.company}`);
    console.log(`  Contact: ${update.contactName}`);
    console.log(`  Title: ${update.title}`);
    console.log(`  Email: ${update.email}`);
    console.log(`  Source: ${update.notes}\n`);
    
    // Update the row (columns C, D, E, G, J)
    // C=Contact Name, D=Title, E=Email, G=LinkedIn, J=Status
    await sheets.spreadsheets.values.update({
      spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
      range: `Sheet1!C${update.row}:J${update.row}`,
      valueInputOption: 'RAW',
      resource: {
        values: [[
          update.contactName,  // C: Contact Name
          update.title,        // D: Title
          update.email,        // E: Email
          '',                  // F: Website (keep existing)
          update.linkedin,     // G: LinkedIn
          '',                  // H: Sector Focus (keep existing)
          '',                  // I: Portfolio Companies (keep existing)
          update.status        // J: Status
        ]]
      }
    });
  }
  
  console.log('✅ Sheet updated successfully!');
  console.log(`\nTotal enriched: ${updates.length} firm(s)`);
}

updateEnrichment().catch(console.error);
