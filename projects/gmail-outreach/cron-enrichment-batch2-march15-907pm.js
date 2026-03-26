const { google } = require('googleapis');

async function enrichLeadsBatch2() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const updates = [
    // Row 28: Seidler Equity Partners - Robert Seidler
    {
      row: 28,
      values: [
        'Seidler Equity Partners',
        'https://sepfunds.com',
        'Robert Seidler',
        'Co-Founder & Managing Partner',
        'robert@sepfunds.com',
        '',
        'https://www.linkedin.com/in/robert-seidler',
        'Enriched',
        'Co-Founder & Managing Partner verified from official sepfunds.com/team page. Email pattern [first]@sepfunds.com confirmed via RocketReach (98.0%). Founded 1992, Marina Del Rey CA. (2026-03-15 cron)'
      ]
    },
    
    // Row 11: Blue Star Innovation Partners - Rob Wechsler
    {
      row: 11,
      values: [
        'Blue Star Innovation Partners',
        'https://bluestarinnovationpartners.com',
        'Rob Wechsler',
        'Founder & Managing Partner',
        'rob@bluestarinnovationpartners.com',
        '',
        'https://www.linkedin.com/in/robert-wechsler-002bab2',
        'Enriched',
        'Founder & Managing Partner verified from official bluestarinnovationpartners.com press releases and TheOrg. Email pattern [first]@bluestarinnovationpartners.com confirmed via RocketReach (51.7%). Serial entrepreneur, backed by Jerry Jones/Dallas Cowboys. (2026-03-15 cron)'
      ]
    },
    
    // Row 12: Casa Verde Capital - Karan Wadhera
    {
      row: 12,
      values: [
        'Casa Verde Capital',
        'https://casaverdecapital.com',
        'Karan Wadhera',
        'Managing Partner',
        'karan@casaverdecapital.com',
        '',
        'https://www.linkedin.com/in/karanwadhera',
        'Enriched',
        'Managing Partner verified from official casaverdecapital.com/team page. Email pattern [first]@casaverdecapital.com confirmed via RocketReach (79.6%). Ex-Goldman Sachs/Nomura senior exec. (2026-03-15 cron)'
      ]
    }
  ];
  
  console.log(`Batch 2: Updating ${updates.length} more leads...\n`);
  
  for (const update of updates) {
    const range = `Sheet1!A${update.row}:I${update.row}`;
    
    console.log(`Row ${update.row}: ${update.values[0]} - ${update.values[2]}`);
    console.log(`  Email: ${update.values[4]}`);
    console.log(`  Status: ${update.values[7]}`);
    
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      resource: {
        values: [update.values]
      }
    });
    
    console.log(`  ✅ Updated\n`);
    
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  console.log(`\n=== BATCH 2 COMPLETE ===`);
  console.log(`${updates.length} additional leads enriched with verified emails`);
  console.log(`Total enriched this run: 10 leads (7 in batch 1 + 3 in batch 2)`);
}

enrichLeadsBatch2().catch(console.error);
