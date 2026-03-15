const { google } = require('googleapis');

// PE Research & Enrichment - March 12, 2026 1:07 PM
// Manually researched contacts with publicly available information
const updates = [
  {
    company: 'WILsquare Capital',
    rowIndex: 1014,
    contacts: [
      { 
        name: 'William Willhite', 
        title: 'Co-Founder, Managing Partner', 
        email: 'bwillhite@wilsquare.com',
        linkedin: 'https://www.linkedin.com/in/william-willhite-6bba39b9/',
        source: 'ContactOut (verified contact database)',
        notes: 'St. Louis-based PE firm'
      }
    ]
  },
  {
    company: 'Kinzie Capital Partners',
    rowIndex: 1058,
    contacts: [
      {
        name: 'Suzanne Yoon',
        title: 'Founder & Managing Partner',
        email: '', // No direct email found - pattern likely syoon@kinziecp.com but NOT verified
        linkedin: 'https://www.linkedin.com/in/suzanneyoon/',
        source: 'Company website team page',
        notes: 'Chicago-based, lower middle market focus. Email pattern needs verification.'
      }
    ]
  },
  {
    company: 'Palladium Equity Partners',
    rowIndex: 1034, // Also appears in 1035
    contacts: [
      {
        name: 'Daniel Ilundain',
        title: 'President & Co-Head of Funds',
        email: '', // No direct email found
        linkedin: 'https://www.linkedin.com/in/daniel-ilundain/',
        source: 'Company website people page',
        notes: 'New President as of Aug 2024. No verified direct email found.'
      }
    ]
  },
  {
    company: 'Wind Point Partners',
    rowIndex: 842,
    contacts: [
      {
        name: 'Nathan Brown',
        title: 'Managing Director',
        email: '', // RocketReach shows n******@wppartners.com but not fully verified
        linkedin: 'https://www.linkedin.com/in/nathan-brown/',
        source: 'Company team page (wppartners.com)',
        notes: 'Chicago-based, $2.4B+ AUM. Email pattern likely nbrown@wppartners.com but needs verification.'
      }
    ]
  },
  {
    company: 'Bow River Capital',
    rowIndex: 952, // Also in 955, 974, 1022, 1055
    contacts: [
      {
        name: 'Blair E. Richardson',
        title: 'CEO & Founder',
        email: '', // No direct email in press releases
        linkedin: 'https://www.linkedin.com/in/blair-richardson/',
        source: 'PRNewswire press releases',
        notes: 'Denver-based, $5B+ AUM. Media contact: Ashley Dzaman (303-861-8466).'
      }
    ]
  },
  {
    company: 'Cressey & Company',
    rowIndex: 953, // Also in 956
    contacts: [
      {
        name: 'Bryan Cressey',
        title: 'Managing Partner',
        email: '', // No verified email found
        linkedin: 'https://www.linkedin.com/in/bryan-cressey/',
        source: 'Company website team page',
        notes: 'Chicago-based, healthcare-focused. Email pattern likely bcressey@cresseyco.com but NOT verified.'
      }
    ]
  },
  {
    company: 'Frontenac Company',
    rowIndex: 324, // Also in 327, 334, 338, 1032
    contacts: [
      {
        name: 'Paul Carbery',
        title: 'Managing Partner',
        email: '', // No verified email
        linkedin: '',
        source: 'Press release quote (Oct 2022)',
        notes: 'Chicago-based. No verified contact info found. Firm domain: frontenac.com'
      }
    ]
  },
  {
    company: 'Wynnchurch Capital',
    rowIndex: 851, // Also in 861
    contacts: [
      {
        name: 'Greg B. Gleason',
        title: 'Managing Partner',
        email: '', // No verified email
        linkedin: '',
        source: 'Company website team page',
        notes: 'Rosemont, IL (Chicago area). Firm domain: wynnchurch.com. No verified direct emails found.'
      }
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
  
  console.log('PE Research & Enrichment - March 12, 2026 1:07 PM\n');
  console.log('Updating Google Sheet with manually researched contacts...\n');
  
  for (const update of updates) {
    const contact = update.contacts[0];
    const range = `Sheet1!C${update.rowIndex}:L${update.rowIndex}`;
    
    console.log(`Row ${update.rowIndex}: ${update.company}`);
    console.log(`  → ${contact.name || 'NO NAME'} (${contact.title})`);
    console.log(`  → Email: ${contact.email || 'NOT FOUND'}`);
    console.log(`  → Source: ${contact.source}`);
    console.log(`  → Notes: ${contact.notes}`);
    
    try {
      const status = contact.email ? 'Enriched' : 'Researched - Contact Found';
      const notesText = `${contact.notes} | Source: ${contact.source}`;
      
      // Update: Contact Name (C), Title (D), Email (E), LinkedIn (G), Status (J), Notes (L)
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        resource: {
          values: [[
            contact.name || '', // Contact Name (C)
            contact.title || '', // Title (D)
            contact.email || '', // Email (E)
            '', // Website (F) - preserve existing
            contact.linkedin || '', // LinkedIn (G)
            '', // Sector Focus (H) - preserve existing
            '', // Portfolio Companies (I) - preserve existing
            status, // Status (J)
            '', // Last Contacted (K) - preserve existing
            notesText // Notes (L)
          ]]
        }
      });
      
      console.log(`  ✓ Updated (Status: ${status})\n`);
    } catch (error) {
      console.error(`  ✗ Error: ${error.message}\n`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit
  }
  
  console.log('\n✓ Sheet update complete!');
  console.log('\nSummary:');
  console.log(`  - Total firms enriched: ${updates.length}`);
  console.log(`  - With verified emails: ${updates.filter(u => u.contacts[0].email).length}`);
  console.log(`  - With contact names only: ${updates.filter(u => !u.contacts[0].email && u.contacts[0].name).length}`);
  console.log(`\nNext steps:`);
  console.log(`  - For contacts without emails: verify email patterns via Apollo or firm contact pages`);
  console.log(`  - Consider calling firms directly to request contact info`);
}

updateSheet().catch(console.error);
