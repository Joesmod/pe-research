const { google } = require('googleapis');

async function updateEnrichmentsBatch2() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const updates = [
    {
      row: 415,
      company: 'Juggernaut Capital Partners',
      contactName: 'John Shulman',
      title: 'Founder & Managing Partner',
      email: 'jshulman@juggernautcap.com',
      linkedin: 'https://www.linkedin.com/in/john-shulman-52295319/',
      status: 'Enriched',
      notes: 'Founded 2009. Consumer, pharmaceutical, business services focus. Email pattern verified via RocketReach. Leads Investment Committee. 25+ years private investment experience.'
    },
    {
      row: 560,
      company: 'Apogem Capital',
      contactName: 'Anna Reed',
      title: 'Managing Director - Healthcare Leveraged Finance',
      email: 'areed@apogemcapital.com',
      linkedin: 'https://www.linkedin.com/in/anna-reed-16752a9/',
      status: 'Enriched',
      notes: 'Email verified via ContactOut (2025). Private Credit/Leveraged Finance firm (not traditional PE). Denver-based. Healthcare sector focus.'
    },
    {
      row: 686,
      company: 'Traction Capital',
      contactName: 'Justin Turner',
      title: 'Managing Partner',
      email: 'jturner@tractioncp.com',
      linkedin: '',
      status: 'Enriched',
      notes: 'Permanent equity firm (not traditional PE). Seattle/Tacoma-based. $2M-$10M EBITDA targets. Long-term ownership (20+ years). Also contact: Peter Bell (VP) - peterbell@tractioncp.com'
    }
  ];
  
  console.log(`Preparing to update ${updates.length} rows (Batch 2)...`);
  
  for (const update of updates) {
    const range = `Sheet1!C${update.row}:J${update.row}`;
    const values = [[
      update.contactName || '',
      update.title || '',
      update.email || '',
      '', // Website (keeping existing)
      update.linkedin || '',
      '', // Sector Focus (keeping existing)
      update.notes || '',
      update.status || 'Enriched'
    ]];
    
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        resource: { values }
      });
      console.log(`✓ Updated ${update.company} (row ${update.row})`);
    } catch (error) {
      console.error(`✗ Failed to update ${update.company}:`, error.message);
    }
  }
  
  console.log('\nBatch 2 enrichment update complete!');
}

updateEnrichmentsBatch2().catch(console.error);
