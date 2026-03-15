const { google } = require('googleapis');

// Enriched contacts for new firms
const updates = [
  {
    company: 'Gemspring Capital',
    rowIndex: 1051,
    contacts: [
      { name: 'Thomas Henry', title: 'Vice President', email: 'thenry@gemspring.com', linkedin: 'http://www.linkedin.com/in/tprhenr' }
    ]
  },
  {
    company: 'Gryphon Investors',
    rowIndex: 1052,
    contacts: [
      { name: 'John Emm', title: 'Vice President', email: 'emm@gryphoninvestors.com', linkedin: 'http://www.linkedin.com/in/john-emm' }
    ]
  },
  {
    company: 'Sterling Investment Partners',
    rowIndex: 1053,
    contacts: [
      { name: 'Dan Yu', title: 'Partner', email: 'yu@sterlinglp.com', linkedin: 'http://www.linkedin.com/in/dan-yu-a5a73713' }
    ]
  },
  {
    company: 'Blue Point Capital Partners',
    rowIndex: 1054,
    contacts: [
      { name: 'Alex Weinstein', title: 'Vice President', email: 'aweinstein@bluepointcapital.com', linkedin: 'http://www.linkedin.com/in/alex-weinstein-488a9874' }
    ]
  }
];

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  console.log('Updating new firms with enriched contacts...\n');
  
  for (const update of updates) {
    const contact = update.contacts[0];
    const range = `Sheet1!B${update.rowIndex}:L${update.rowIndex}`;
    
    console.log(`Row ${update.rowIndex}: ${update.company}`);
    console.log(`  → ${contact.name} (${contact.title})`);
    console.log(`  → ${contact.email}`);
    
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        resource: {
          values: [[
            '',                      // NotebookLM (B)
            contact.name,            // Contact Name (C)
            contact.title,           // Title (D)
            contact.email,           // Email (E)
            '',                      // Website (F) - keep existing
            contact.linkedin,        // LinkedIn (G)
            '',                      // Sector Focus (H) - keep existing
            '',                      // Portfolio Companies (I)
            'Enriched',              // Status (J)
            '',                      // Last Contacted (K)
            'Source: Apollo.io'      // Notes (L)
          ]]
        }
      });
      
      console.log(`  ✓ Updated\n`);
    } catch (error) {
      console.error(`  ✗ Error: ${error.message}\n`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n✓ New firms update complete!');
}

updateSheet().catch(console.error);
