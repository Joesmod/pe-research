const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function enrichSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // First, get current sheet data to find correct row numbers
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:L'
  });
  
  const rows = response.data.values;
  
  // Find row numbers for specific firms
  const updates = [];
  
  rows.forEach((row, index) => {
    const rowNum = index + 1; // 1-indexed
    const firmName = row[0]; // Column A = Firm Name
    
    // LNC Partners - add Mark Raterman
    if (firmName === 'LNC Partners') {
      updates.push({
        row: rowNum,
        company: 'LNC Partners',
        contact: 'Mark Raterman',
        title: 'Managing Partner & Co-Founder',
        email: 'Raterman@LNC-Partners.com',
        status: 'Enriched',
        notes: 'Managing Partner & Co-Founder. Email verified from LNC company PDF (lnc-partners.com/wp-content/uploads/2025/06/LNC-Overview-June-2025.pdf). Lower middle market PE, $1B+ AUM, tech-enabled B2B services focus. Chicago-based. [Enriched: 2026-03-07 cron]',
        source: 'LNC Partners company PDF'
      });
    }
    
    // Plexus Capital - verify Michael Painter
    if (firmName === 'Plexus Capital, LLC' || firmName === 'Plexus Capital') {
      updates.push({
        row: rowNum,
        company: 'Plexus Capital',
        contact: 'Michael Painter',
        title: 'Co-Founder, Managing Partner & Owner',
        email: 'mpainter@plexuscap.com',
        status: 'Enriched',
        notes: 'Co-Founder, Managing Partner, and Owner. Email verified from ContactOut (mpainter@plexuscap.com). Nashville/Raleigh-based lower middle market PE. Also: Jay Jester (Partner, ACG Legend Award 2024). [Enriched: 2026-03-07 cron]',
        source: 'ContactOut + plexuscap.com'
      });
    }
    
    // Mark non-PE firms as Dead
    if (firmName === 'Millennium Bridge Capital') {
      updates.push({
        row: rowNum,
        company: 'Millennium Bridge Capital',
        status: 'Dead',
        statusReason: 'Fund-of-funds / co-investment platform. Does not invest directly in operating companies. [2026-03-07 cron]'
      });
    }
    
    if (firmName === 'Columbia West Capital') {
      updates.push({
        row: rowNum,
        company: 'Columbia West Capital',
        status: 'Dead',
        statusReason: 'Investment banking / M&A advisory firm, not traditional PE investor. [2026-03-07 cron]'
      });
    }
    
    if (firmName === 'Pathway Capital Management') {
      updates.push({
        row: rowNum,
        company: 'Pathway Capital Management',
        status: 'Dead',
        statusReason: 'Fund-of-funds and secondaries investor. Does not invest directly in operating companies. Acquired by Clearlake 2024. [2026-03-07 cron]'
      });
    }
    
    if (firmName === 'Obra Capital') {
      updates.push({
        row: rowNum,
        company: 'Obra Capital',
        status: 'Dead',
        statusReason: 'Alternative asset manager focused on insurance-linked strategies and specialty credit. Not traditional middle-market PE. $6.9B AUM. [2026-03-07 cron]'
      });
    }
    
    if (firmName === 'ArrowMark Partners') {
      updates.push({
        row: rowNum,
        company: 'ArrowMark Partners',
        status: 'Dead',
        statusReason: 'Asset management firm managing CLO funds, leveraged loans, equity strategies. Not a PE investor. [2026-03-07 cron]'
      });
    }
    
    if (firmName === 'Quake Capital Partners') {
      updates.push({
        row: rowNum,
        company: 'Quake Capital Partners',
        status: 'Dead',
        statusReason: 'Early-stage venture capital and accelerator, not mid-market PE. Austin-based. [2026-03-07 cron]'
      });
    }
    
    if (firmName === 'Funden') {
      updates.push({
        row: rowNum,
        company: 'Funden',
        status: 'Dead',
        statusReason: 'Fundraising platform for startups, not a PE firm. CEO: Daniel Rongo. [2026-03-07 cron]'
      });
    }
    
    if (firmName === 'Capital Allocators') {
      updates.push({
        row: rowNum,
        company: 'Capital Allocators',
        status: 'Dead',
        statusReason: 'Podcast and media platform hosted by Ted Seides, not a PE firm. [2026-03-07 cron]'
      });
    }
  });
  
  console.log(`Found ${updates.length} updates to make...\n`);
  
  // Execute updates
  for (const update of updates) {
    try {
      if (update.contact) {
        // Update enriched contact info
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `Sheet1!C${update.row}`,
          valueInputOption: 'RAW',
          resource: { values: [[update.contact]] }
        });
        
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `Sheet1!D${update.row}`,
          valueInputOption: 'RAW',
          resource: { values: [[update.title]] }
        });
        
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `Sheet1!E${update.row}`,
          valueInputOption: 'RAW',
          resource: { values: [[update.email]] }
        });
        
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `Sheet1!J${update.row}`,
          valueInputOption: 'RAW',
          resource: { values: [[update.status]] }
        });
        
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `Sheet1!L${update.row}`,
          valueInputOption: 'RAW',
          resource: { values: [[update.notes]] }
        });
        
        console.log(`✓ Row ${update.row}: ${update.company} → ${update.contact} (${update.email})`);
      } else if (update.statusReason) {
        // Update status for non-PE firms
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `Sheet1!J${update.row}`,
          valueInputOption: 'RAW',
          resource: { values: [[update.status]] }
        });
        
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `Sheet1!L${update.row}`,
          valueInputOption: 'RAW',
          resource: { values: [[update.statusReason]] }
        });
        
        console.log(`✓ Row ${update.row}: ${update.company} → Marked ${update.status}`);
      }
    } catch (err) {
      console.error(`✗ Row ${update.row}: ${update.company} → ${err.message}`);
    }
  }
  
  console.log('\nEnrichment complete!');
}

enrichSheet().catch(console.error);
