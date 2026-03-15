const { google } = require('googleapis');

// Second batch of enriched contacts from Apollo
const updates = [
  {
    company: 'Levine Leichtman Capital Partners, LLC',
    rowIndex: 525,
    contacts: [
      { name: 'David Wolmer', title: 'Partner, Co-Chief Operating Officer and General Counsel', email: 'dwolmer@llcp.com', linkedin: 'http://www.linkedin.com/in/david-wolmer-92013b37' }
    ]
  },
  {
    company: 'Peninsula Capital Partners L.L.C.',
    rowIndex: 531,
    contacts: [
      { name: 'Andrew Wiegand', title: 'Partner', email: 'wiegand@peninsulafunds.com', linkedin: 'http://www.linkedin.com/in/andrew-wiegand-04ba8129' }
    ]
  },
  {
    company: 'RA Capital Management',
    rowIndex: 535,
    contacts: [
      { name: 'Justin Waney', title: 'Vice President, Structured Capital', email: 'jwaney@racap.com', linkedin: 'http://www.linkedin.com/in/justin-waney-b7991355' }
    ]
  },
  {
    company: 'Emerging Capital Partners - ECP',
    rowIndex: 511,
    contacts: [
      { name: 'Carolyn Campbell', title: 'Managing Partner, Ceo/coo and Founder', email: 'campbellc@ecpinvestments.com', linkedin: 'http://www.linkedin.com/in/-carolyn-campbell' }
    ]
  },
  {
    company: 'Invision Capital',
    rowIndex: 919,
    contacts: [
      { name: 'Nathan Bullard', title: 'Vice President', email: 'nbullard@invcg.com', linkedin: 'http://www.linkedin.com/in/nathanbullard' }
    ]
  },
  {
    company: 'Sverica Capital Management',
    rowIndex: 938,
    contacts: [
      { name: 'Greg Hylant', title: 'Vice President', email: 'ghylant@sverica.com', linkedin: 'http://www.linkedin.com/in/greg-hylant-57094113' }
    ]
  },
  {
    company: 'Chicago Pacific Founders',
    rowIndex: 939,
    contacts: [
      { name: 'Matthew Doyle', title: 'Partner / Chief Operating Officer / Head of Investor Relations', email: 'mdoyle@cpfounders.com', linkedin: 'http://www.linkedin.com/in/mattdoyle22' }
    ]
  },
  {
    company: 'NexPhase Capital',
    rowIndex: 941,
    contacts: [
      { name: 'Jeffrey Fung', title: 'Vice President', email: 'jfung@nexphase.com', linkedin: 'http://www.linkedin.com/in/jeffrey-fung-a3257a71' }
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
  
  console.log('Updating Google Sheet with enriched contacts (Batch 2)...\n');
  
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
            '', // NotebookLM (B)
            contact.name, // Contact Name (C)
            contact.title, // Title (D)
            contact.email, // Email (E)
            '', // Website (F)
            contact.linkedin, // LinkedIn (G)
            '', // Sector Focus (H)
            '', // Portfolio Companies (I)
            'Enriched', // Status (J)
            '', // Last Contacted (K)
            'Source: Apollo.io' // Notes (L)
          ]]
        }
      });
      
      console.log(`  ✓ Updated\n`);
    } catch (error) {
      console.error(`  ✗ Error: ${error.message}\n`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n✓ Batch 2 update complete!');
}

updateSheet().catch(console.error);
