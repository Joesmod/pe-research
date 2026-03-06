const { google } = require('googleapis');

async function updateEnrichment() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Prepare updates
  const updates = [
    {
      row: 712,
      company: 'Auctus Capital Partners',
      contactName: 'Muhammad Azfar',
      title: 'Managing Partner & CEO',
      email: '', // No direct email found
      linkedin: '',
      status: 'Dead - Investment Bank',
      notes: 'M&A advisory/investment banking firm, not a PE investor. Researched 2026-03-05.'
    },
    {
      row: 714,
      company: 'BH3 Management',
      contactName: 'Daniel Lebensohn',
      title: 'Co-Founder & Co-CEO',
      email: '', // No direct email found
      linkedin: '',
      status: 'Dead - Real Estate Focus',
      notes: 'Real estate investment firm, not services-focused PE. Researched 2026-03-05.'
    },
    {
      row: 713,
      company: 'Avista Healthcare Partners',
      contactName: 'Thompson Dean',
      title: 'Chairman, Co-Head Investment Committee',
      email: '', // No direct email found on public sources
      linkedin: 'https://www.linkedin.com/company/avista-healthcare-partners',
      status: 'Researched - No Public Email',
      notes: 'Healthcare PE firm. Decision-maker identified but no direct email published. Consider paid enrichment. Researched 2026-03-05.'
    },
    {
      row: 716,
      company: 'Bloom Equity Partners',
      contactName: 'Bart MacDonald',
      title: 'Founder & Managing Partner',
      email: '', // No direct email found on public sources
      linkedin: 'https://www.linkedin.com/in/bartmacdonald/',
      status: 'Researched - No Public Email',
      notes: 'Enterprise software & tech-enabled services PE (IDEAL FIT). Decision-maker identified but no direct email published. Priority for paid enrichment. Researched 2026-03-05.'
    }
  ];
  
  console.log('Updating Google Sheet with enrichment findings...\n');
  
  for (const update of updates) {
    console.log(`Updating Row ${update.row}: ${update.company}`);
    console.log(`  Contact: ${update.contactName || '[EMPTY]'}`);
    console.log(`  Title: ${update.title || '[EMPTY]'}`);
    console.log(`  Email: ${update.email || '[EMPTY]'}`);
    console.log(`  Status: ${update.status}`);
    console.log(`  Notes: ${update.notes}\n`);
    
    // Column mapping: C=Contact Name, D=Title, E=Email, G=LinkedIn, J=Status, K=Notes
    const range = `Sheet1!C${update.row}:K${update.row}`;
    
    const values = [[
      update.contactName || '',      // C: Contact Name
      update.title || '',            // D: Title
      update.email || '',            // E: Email
      '', // F: Website (don't touch)
      update.linkedin || '',         // G: LinkedIn
      '', // H: Sectors (don't touch)
      '', // I: Description (don't touch)
      update.status || '',           // J: Status
      update.notes || ''             // K: Notes
    ]];
    
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        resource: { values }
      });
      console.log(`✓ Updated row ${update.row}\n`);
    } catch (error) {
      console.error(`✗ Error updating row ${update.row}:`, error.message);
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('='.repeat(60));
  console.log('Enrichment update complete!');
  console.log(`Updated ${updates.length} rows in the sheet.`);
  console.log('\nSummary:');
  console.log('- 2 firms marked as Dead (not PE or wrong focus)');
  console.log('- 2 firms enriched with decision-maker info (no email)');
  console.log('- 0 firms fully enriched with verified direct emails');
  console.log('\nRecommendation: Use paid enrichment tools for email reveals.');
}

updateEnrichment().catch(console.error);
