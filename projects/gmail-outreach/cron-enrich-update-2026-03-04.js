const { google } = require('googleapis');
const fs = require('fs');

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Enrichment updates from cron research 2026-03-04 05:36 UTC
  const updates = [
    {
      company: 'Regal Healthcare Capital Partners',
      contactName: 'Jon Santemma',
      email: 'jsantemma@regalhcp.com',
      source: 'ContactOut (published source)',
      notes: 'Co-Founder & General Partner - Email verified from ContactOut'
    },
    {
      company: 'Regal Healthcare Capital Partners',
      contactName: 'Terry Wang',
      email: 'twang@regalhcp.com',
      source: 'ContactOut (published source)',
      notes: 'Partner - Email verified from ContactOut'
    },
    {
      company: 'SDC Capital Partners',
      contactName: 'Doug Kaden',
      email: 'dkaden@sdccapitalpartners.com',
      source: 'RocketReach (pattern)',
      notes: 'Managing Partner - Email pattern from RocketReach, verified on official team page'
    },
    {
      company: 'Rockbridge Growth Equity, LLC',
      contactName: 'Spencer Hughes',
      email: 'spencer@rbequity.com',
      source: 'ContactOut (published source)',
      notes: 'Principal (listed as VP on team page) - Email verified from ContactOut'
    },
    {
      company: 'Aeris Partners',
      contactName: 'David Joncas',
      email: 'dwj@aerispartners.com',
      source: 'ContactOut (published source)',
      notes: 'Co-Founder & Managing Director - Email verified from ContactOut'
    },
    {
      company: 'Alvarez & Marsal Capital',
      contactName: 'Jack McCarthy',
      email: 'jmccarthy@a-mcapital.com',
      source: 'RocketReach (pattern)',
      notes: 'Senior Managing Director & Founder - Email pattern from RocketReach'
    },
    {
      company: 'Cornell Capital',
      contactName: 'Henry Cornell',
      email: 'hcornell@cornellcapllc.com',
      source: 'RocketReach (pattern)',
      notes: 'Senior Partner & Founder - Email pattern from RocketReach, official team page confirmed'
    },
    {
      company: 'Casa Verde Capital',
      contactName: 'Karan Wadhera',
      email: 'karan@casaverdecapital.com',
      source: 'ContactOut (published source)',
      notes: 'Managing Partner - Email verified from ContactOut'
    }
  ];
  
  console.log('Reading current sheet data...\n');
  
  // Read current sheet
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:J'
  });
  
  const rows = response.data.values;
  const headers = rows[0];
  
  // Column indices - NOTE: There's a "NotebookLM" column at index 1!
  const colCompany = 0;   // A
  const colNotebook = 1;  // B (NotebookLM)
  const colContact = 2;   // C
  const colTitle = 3;     // D
  const colEmail = 4;     // E
  const colWebsite = 5;   // F
  const colLinkedIn = 6;  // G
  const colSector = 7;    // H
  const colPortfolio = 8; // I
  const colStatus = 9;    // J
  const colNotes = 10;    // K
  
  console.log(`Columns: Company=${colCompany}, Contact=${colContact}, Email=${colEmail}, Status=${colStatus}\n`);
  
  const batchUpdates = [];
  let updatedCount = 0;
  
  for (const update of updates) {
    // Find the row for this company+contact
    let found = false;
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const company = row[colCompany] || '';
      const contactName = row[colContact] || '';
      
      // Debug: check for Aeris and Cornell specifically
      if ((company.includes('Aeris') || company.includes('Cornell')) && i < 20) {
        console.log(`Row ${i+1}: "${company}" | "${contactName}"`);
      }
      
      if (company === update.company && contactName === update.contactName) {
        console.log(`✓ Found: ${company} - ${contactName} at row ${i + 1}`);
        found = true;
        
        // Update email, status, and notes
        const rowIndex = i + 1; // Google Sheets is 1-indexed
        
        batchUpdates.push({
          range: `Sheet1!E${rowIndex}`, // Email column (E because of NotebookLM shift)
          values: [[update.email]]
        });
        
        batchUpdates.push({
          range: `Sheet1!J${rowIndex}`, // Status column (J because of NotebookLM shift)
          values: [['Enriched - Web Research']]
        });
        
        batchUpdates.push({
          range: `Sheet1!K${rowIndex}`, // Notes column (K because of NotebookLM shift)
          values: [[`${update.notes} (Source: ${update.source}) [Enriched: 2026-03-04 cron]`]]
        });
        
        updatedCount++;
        break;
      }
    }
    
    if (!found) {
      console.log(`✗ Not found: ${update.company} - ${update.contactName}`);
    }
  }
  
  if (batchUpdates.length > 0) {
    console.log(`\nApplying ${batchUpdates.length} updates to sheet...`);
    
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'RAW',
        data: batchUpdates
      }
    });
    
    console.log(`\n✅ Successfully enriched ${updatedCount} leads!`);
  } else {
    console.log('\n⚠️  No matching rows found to update.');
  }
  
  // Log summary
  const summary = {
    timestamp: new Date().toISOString(),
    enrichedCount: updatedCount,
    updates: updates.map(u => `${u.company} - ${u.contactName}: ${u.email}`)
  };
  
  fs.writeFileSync(
    'enrichment-log-cron-2026-03-04.json',
    JSON.stringify(summary, null, 2)
  );
  
  console.log('\n📝 Log saved to enrichment-log-cron-2026-03-04.json');
}

updateSheet().catch(console.error);
