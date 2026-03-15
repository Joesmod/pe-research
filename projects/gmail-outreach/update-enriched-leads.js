const { google } = require('googleapis');

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Define the enrichment data
  const enrichments = [
    {
      row: 1202, // Svoboda Capital Partners
      company: 'Svoboda Capital Partners',
      contact: 'Tom Brooker',
      title: 'Managing Director & Operating Partner',
      email: 'tbrooker@svoco.com',
      website: 'https://svoco.com',
      linkedin: 'https://www.linkedin.com/in/tom-brooker-4aa87b15/',
      status: 'Enriched',
      notes: 'Email verified via ContactOut. Chicago-based PE firm, $400M+ AUM, founded 1998, focuses on business services.'
    },
    {
      row: 1203, // GenNx360 Capital Partners
      company: 'GenNx360 Capital Partners',
      contact: 'Carmen Rojas',
      title: 'Director of Investor Relations',
      email: 'crojas@gennx360.com',
      website: 'https://gennx360.com',
      linkedin: '',
      status: 'Enriched',
      notes: 'Email from PR Newswire press release (Jan 2025). NYC-based PE firm, founded 2006, industrial & business services focus.'
    },
    {
      row: 1204, // WILsquare Capital
      company: 'WILsquare Capital',
      contact: 'Bill Willhite',
      title: 'Managing Partner & Co-Founder',
      email: 'bwillhite@WILsquare.com',
      website: 'https://www.wilsquare.com',
      linkedin: '',
      status: 'Enriched',
      notes: 'Email from official website contact page. St. Louis-based PE firm, lower middle-market, Midwest & South focus.'
    },
    {
      row: 1198, // Rockwood Equity (replacing Brett Keith)
      company: 'Rockwood Equity',
      contact: 'Kate Faust',
      title: 'Partner, Business Development',
      email: 'kfaust@rockwoodequity.com',
      website: 'https://www.rockwoodequity.com',
      linkedin: 'https://www.linkedin.com/in/katefaust',
      status: 'Enriched',
      notes: 'Email pattern verified via RocketReach (first_initial+last@domain, 100%). Lower middle-market PE, 25 years experience.'
    },
    {
      row: 1199, // Linden Capital Partners (replacing Anthony B. Davis)
      company: 'Linden Capital Partners',
      contact: 'Prab Chawla',
      title: 'Managing Director',
      email: 'pchawla@lindenllc.com',
      website: 'https://www.linden.com',
      linkedin: 'https://www.linkedin.com/in/prabchawla/',
      status: 'Enriched',
      notes: 'Email pattern verified via RocketReach (first_initial+last@lindenllc.com, 99%). Chicago-based, healthcare-focused PE.'
    },
    {
      row: 1201, // One Equity Partners (replacing J.B. Cherry)
      company: 'One Equity Partners',
      contact: 'David Lippin',
      title: 'Partner, Head of Investor Relations',
      email: 'david.lippin@oneequity.com',
      website: 'https://www.oneequity.com',
      linkedin: 'https://www.linkedin.com/in/david-lippin-5921775/',
      status: 'Enriched',
      notes: 'Email pattern verified via RocketReach (first.last@oneequity.com, 99.4%). Middle-market PE, industrial/healthcare/tech sectors.'
    }
  ];
  
  console.log(`\n=== UPDATING ${enrichments.length} LEADS IN GOOGLE SHEET ===\n`);
  
  for (const item of enrichments) {
    const range = `Sheet1!A${item.row}:L${item.row}`;
    
    // Column mapping:
    // A=Company, B=NotebookLM, C=Contact Name, D=Title, E=Email, F=Website, G=LinkedIn, H=Status, I=Notes
    const values = [[
      item.company,
      '', // NotebookLM column (leave empty)
      item.contact,
      item.title,
      item.email,
      item.website,
      item.linkedin,
      item.status,
      item.notes,
      '', // Status (duplicate? leave empty)
      '', // Last Contacted
      ''  // Notes (duplicate? leave empty)
    ]];
    
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        resource: { values }
      });
      
      console.log(`✓ Row ${item.row}: ${item.company} → ${item.contact} (${item.email})`);
    } catch (error) {
      console.error(`✗ Row ${item.row}: ${item.company} - Error:`, error.message);
    }
  }
  
  console.log(`\n=== ENRICHMENT COMPLETE ===`);
  console.log(`Total leads enriched: ${enrichments.length}`);
  console.log(`\nNext steps:`);
  console.log(`1. Verify updates in Google Sheet`);
  console.log(`2. Update GitHub dossiers in pe-research/PE-firms/`);
  console.log(`3. Commit and push to https://github.com/Joesmod/pe-research`);
}

updateSheet().catch(console.error);
