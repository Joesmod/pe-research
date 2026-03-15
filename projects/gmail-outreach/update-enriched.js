const { google } = require('googleapis');

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const updates = [
    {
      row: 894,
      company: 'Sverica Capital Management',
      contact: 'Jordan Richards',
      title: 'Managing Partner',
      email: 'jordan@sverica.com',
      linkedin: 'https://www.linkedin.com/in/jordan-richards-9514b45/',
      status: 'Enriched',
      notes: 'Email pattern verified via ContactOut (dave@sverica.com → first@sverica.com). Austin office. Source: ContactOut + Sverica team page. Enriched 2026-03-12 cron.'
    },
    {
      row: 938,
      company: 'Sverica Capital Management',
      contact: 'Jordan Richards',
      title: 'Managing Partner',
      email: 'jordan@sverica.com',
      linkedin: 'https://www.linkedin.com/in/jordan-richards-9514b45/',
      status: 'Enriched',
      notes: 'Email pattern verified via ContactOut (dave@sverica.com → first@sverica.com). Austin office. Source: ContactOut + Sverica team page. Enriched 2026-03-12 cron.'
    },
    {
      row: 1037,
      company: 'Sverica Capital Management',
      contact: 'Jordan Richards',
      title: 'Managing Partner',
      email: 'jordan@sverica.com',
      linkedin: 'https://www.linkedin.com/in/jordan-richards-9514b45/',
      status: 'Enriched',
      notes: 'Email pattern verified via ContactOut (dave@sverica.com → first@sverica.com). Austin office. Source: ContactOut + Sverica team page. Enriched 2026-03-12 cron.'
    },
    {
      row: 1046,
      company: 'Sverica Capital Management',
      contact: 'Jordan Richards',
      title: 'Managing Partner',
      email: 'jordan@sverica.com',
      linkedin: 'https://www.linkedin.com/in/jordan-richards-9514b45/',
      status: 'Enriched',
      notes: 'Email pattern verified via ContactOut (dave@sverica.com → first@sverica.com). Austin office. Source: ContactOut + Sverica team page. Enriched 2026-03-12 cron.'
    },
    {
      row: 1049,
      company: 'Sverica Capital Management',
      contact: 'Jordan Richards',
      title: 'Managing Partner',
      email: 'jordan@sverica.com',
      linkedin: 'https://www.linkedin.com/in/jordan-richards-9514b45/',
      status: 'Enriched',
      notes: 'Email pattern verified via ContactOut (dave@sverica.com → first@sverica.com). Austin office. Source: ContactOut + Sverica team page. Enriched 2026-03-12 cron.'
    },
    {
      row: 1061,
      company: 'Rehab Medical',
      contact: 'Kevin Gearheart',
      title: 'Partner',
      email: '',
      linkedin: '',
      status: 'Dead - Not PE/VC firm',
      notes: 'Medical equipment provider (wheelchairs, mobility devices). Not a PE firm. Indianapolis-based. Reviewed 2026-03-12 cron.'
    }
  ];
  
  console.log('=== UPDATING GOOGLE SHEET ===\n');
  
  for (const update of updates) {
    const range = `Sheet1!C${update.row}:L${update.row}`;
    
    const values = [[
      update.contact,      // C: Contact Name
      update.title,        // D: Title
      update.email,        // E: Email
      '',                  // F: Website (keep existing)
      update.linkedin,     // G: LinkedIn
      '',                  // H: Sector Focus (keep existing)
      '',                  // I: Portfolio Companies (keep existing)
      update.status,       // J: Status
      '',                  // K: Last Contacted (keep existing)
      update.notes         // L: Notes
    ]];
    
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        resource: { values }
      });
      
      console.log(`✓ Row ${update.row}: ${update.company}`);
      console.log(`  ${update.contact} | ${update.email || 'N/A'} | ${update.status}`);
      console.log('');
    } catch (error) {
      console.error(`✗ Failed to update row ${update.row}:`, error.message);
    }
    
    // Rate limit
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n=== UPDATE COMPLETE ===');
  console.log(`Updated ${updates.length} rows`);
}

updateSheet().catch(console.error);
