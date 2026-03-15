const { google } = require('googleapis');

async function updateEnrichedLeads() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Enriched leads to update
  const enrichments = [
    {
      company: 'OpenGate Capital',
      row: 9, // Row number in sheet (adjust based on actual position)
      contactName: 'Andrew Nikou',
      title: 'Founder, CEO & Managing Partner',
      email: 'anikou@opengatecapital.com',
      linkedin: 'https://www.linkedin.com/in/andrewnikou/',
      status: 'Enriched',
      notes: 'Email verified via RocketReach/ContactOut 2026-03-14. Founder & CEO since 2005.'
    },
    {
      company: 'Amulet Capital Partners',
      row: 158, // Estimated position - need to find exact row
      contactName: 'Ramsey Frank',
      title: 'CEO & Co-Founder',
      email: 'rfrank@amuletcapital.com',
      linkedin: 'https://www.linkedin.com/in/ramsey-frank/',
      status: 'Enriched',
      notes: 'Email pattern verified via Seamless.AI. Healthcare PE, Greenwich CT. Co-founded with Jay Rose (President, jrose@amuletcapital.com).'
    }
  ];
  
  console.log('Batch updating enriched leads...');
  
  // Note: This is a simplified update. In production, we'd:
  // 1. Find the exact row for each company
  // 2. Update only those specific rows
  // 3. Preserve existing data in other columns
  
  console.log(`Prepared ${enrichments.length} enrichments for update`);
  console.log(JSON.stringify(enrichments, null, 2));
  
  // For now, just log the updates (actual update would require row lookup)
  console.log('\nTo complete: Match company names to sheet rows and apply updates');
}

updateEnrichedLeads().catch(console.error);
