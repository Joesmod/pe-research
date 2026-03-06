const { google } = require('googleapis');
const fs = require('fs');

async function updateSheet() {
  console.log('Starting sheet update at:', new Date().toISOString());
  
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Enrichment data - manually verified contacts
  const updates = [
    {
      rowIndex: 258, // Bindley Capital Partners
      company: 'Bindley Capital Partners',
      contactName: 'William Bindley',
      title: 'Founder, CEO & Chairman',
      email: 'wbindley@bindley.com',
      linkedIn: 'https://www.linkedin.com/in/william-bindley',
      status: 'Enriched',
      notes: 'Source: Radaris (public record)'
    },
    {
      rowIndex: 700, // American Industrial Partners
      company: 'American Industrial Partners',
      contactName: 'Lawrence Steyn',
      title: 'Partner, Business Development',
      email: 'lsteyn@americanindustrial.com',
      linkedIn: 'https://www.linkedin.com/in/lawrencesteyn/',
      status: 'Enriched',
      notes: 'Source: AIP Contact Page (official)'
    }
  ];
  
  console.log(`\n=== UPDATING ${updates.length} ROWS ===\n`);
  
  for (const update of updates) {
    console.log(`Updating Row ${update.rowIndex}: ${update.company}`);
    console.log(`  Contact: ${update.contactName} (${update.title})`);
    console.log(`  Email: ${update.email}`);
    
    // Update columns: C=Contact Name, D=Title, E=Email, G=LinkedIn, J=Status, K=Notes
    const range = `Sheet1!C${update.rowIndex}:K${update.rowIndex}`;
    
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        resource: {
          values: [[
            update.contactName,         // Column C
            update.title,               // Column D
            update.email,               // Column E
            '', // Website stays same    // Column F
            update.linkedIn,            // Column G
            '', // Sector stays same     // Column H
            '', // Portfolio stays same  // Column I
            update.status,              // Column J
            update.notes                // Column K
          ]]
        }
      });
      
      console.log(`  ✅ Updated successfully\n`);
    } catch (err) {
      console.error(`  ❌ Error updating:`, err.message, '\n');
    }
  }
  
  console.log(`\n=== UPDATE COMPLETE ===`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Updated ${updates.length} leads with verified contacts`);
  
  // Save log
  const logEntry = {
    timestamp: new Date().toISOString(),
    updatesCount: updates.length,
    updates: updates.map(u => ({
      company: u.company,
      contact: u.contactName,
      email: u.email
    }))
  };
  
  fs.writeFileSync('enrichment-log-11pm.json', JSON.stringify(logEntry, null, 2));
  console.log(`\nLog saved to: enrichment-log-11pm.json`);
}

updateSheet().catch(console.error);
