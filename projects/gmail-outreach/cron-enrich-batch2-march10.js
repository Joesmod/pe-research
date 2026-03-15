const { google } = require('googleapis');

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Batch 2 enrichment updates for 2026-03-10 cron
  const updates = [
    {
      row: 497,
      company: 'Altus Capital Partners',
      contact: 'Russell J. Greenberg',
      title: 'Founder & Managing Partner',
      email: 'rgreenberg@altuscapitalpartners.com',
      website: 'https://www.altuscapitalpartners.com',
      linkedin: 'https://www.linkedin.com/in/russell-greenberg-0b3883252/',
      status: 'Enriched - 2026-03-10',
      notes: 'Founder & Managing Partner verified from altuscapitalpartners.com/team + RocketReach + ZoomInfo. Email rgreenberg@altuscapitalpartners.com verified from ContactOut. Founded 2003, middle market manufacturing PE, $15.6M revenue, Wilton CT based. Working together since 1998.'
    },
    {
      row: 507,
      company: 'Consonance Capital Partners',
      contact: 'Mitchell J. Blutt, MD',
      title: 'Co-Founder & Managing Partner',
      email: 'mblutt@consonancecapitalpartners.com',
      website: 'https://www.consonancecapitalpartners.com',
      linkedin: 'https://www.linkedin.com/in/mitchell-blutt-8a80122/',
      status: 'Enriched - 2026-03-10',
      notes: 'Co-Founder & Managing Partner verified from consonancecapitalpartners.com/team. Email pattern {first_initial}{last}@consonancecapitalpartners.com verified from ContactOut (90% confidence). $1.3B raised across 2 funds, currently investing Fund II. Healthcare PE, NY-based. Other partners: Benjamin Edmands, Stephen McKenna, Nancy-Ann DeParle (90+ years combined PE experience, former JPMorgan Partners colleagues).'
    }
  ];
  
  console.log('=== UPDATING SHEET - BATCH 2 ===\n');
  
  for (const update of updates) {
    console.log(`Updating Row ${update.row}: ${update.company}`);
    console.log(`  Contact: ${update.contact}`);
    console.log(`  Title: ${update.title}`);
    console.log(`  Email: ${update.email}`);
    console.log(`  Status: ${update.status}`);
    console.log('');
    
    // Update row (columns C=contact, D=title, E=email, F=website, G=linkedin, J=status, L=notes)
    // Range C:L = 10 columns
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Sheet1!C${update.row}:L${update.row}`,
      valueInputOption: 'RAW',
      resource: {
        values: [[
          update.contact,      // C
          update.title,        // D
          update.email,        // E
          update.website,      // F
          update.linkedin,     // G
          '',                  // H - Sector Focus
          '',                  // I - Portfolio Companies
          update.status,       // J
          '',                  // K - Last Contacted
          update.notes         // L
        ]]
      }
    });
  }
  
  console.log('Sheet updated successfully!');
  console.log(`\nBatch 2 total enrichments: ${updates.length}`);
  
  const fs = require('fs');
  const report = {
    timestamp: new Date().toISOString(),
    batch: 2,
    enrichmentCount: updates.length,
    firms: updates.map(u => ({
      company: u.company,
      contact: u.contact,
      email: u.email,
      verificationSource: u.notes.includes('verified from') ? u.notes.split('verified from')[1].split('.')[0] : 'See notes'
    }))
  };
  
  fs.writeFileSync('enrichment-report-batch2-march10.json', JSON.stringify(report, null, 2));
  console.log('\nReport saved to enrichment-report-batch2-march10.json');
}

updateSheet().catch(console.error);
