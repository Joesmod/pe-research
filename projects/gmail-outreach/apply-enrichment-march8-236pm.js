const { google } = require('googleapis');

async function applyEnrichment() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Enrichment updates based on web research - March 8, 2026 2:36pm
  const updates = [
    {
      row: 687, // Valiant Capital Management
      contactName: 'Christopher R. Hansen',
      title: 'Founder & CEO',
      email: 'chansen@valiantcapital.com',
      linkedin: 'https://www.linkedin.com/in/chris-hansen-valiant',
      notes: 'Email pattern verified via ZoomInfo. San Francisco-based global long/short equity hedge fund. $2.7B AUM.',
      status: 'Enriched'
    },
    {
      row: 688, // Victory Capital
      contactName: 'David C. Brown',
      title: 'Chairman & CEO',
      email: 'dbrown@vcm.com',
      linkedin: 'https://www.linkedin.com/in/david-brown-victory-capital',
      notes: 'CEO since 2013. Better contact than IR. Public company (Nasdaq: VCAP). $170B+ AUM.',
      status: 'Enriched'
    },
    {
      row: 690, // Wall Street Oasis
      contactName: 'Patrick Curtis',
      title: 'Founder & CEO',
      email: 'patrick@wallstreetoasis.com',
      linkedin: 'https://www.linkedin.com/in/patrickmanningcurtis/',
      notes: 'Email pattern verified via RocketReach/ContactOut. Largest online community for finance professionals. Wharton MBA.',
      status: 'Enriched'
    },
    {
      row: 692, // Wefunder
      contactName: 'Nicholas Tommarello',
      title: 'Founder & CEO',
      email: 'nick@wefunder.com',
      linkedin: 'https://www.linkedin.com/in/nicktommarello',
      notes: 'Email pattern verified via RocketReach/ZoomInfo. Y Combinator backed. Crowdfunding platform for startups.',
      status: 'Enriched'
    },
    {
      row: 805, // Trinity Capital
      contactName: 'Kyle Brown',
      title: 'CEO & President',
      email: 'kbrown@trinitycap.com',
      linkedin: 'https://www.linkedin.com/in/kyle-brown-trinity',
      notes: 'CEO since 2024. Public company (Nasdaq: TRIN). Tech lending, equipment financing, life sciences. $5.5B+ fundings.',
      status: 'Enriched'
    },
    {
      row: 807, // TriplePoint Capital
      contactName: 'Jim Labe',
      title: 'Co-CEO & Co-Founder',
      email: 'jlabe@triplepointcapital.com',
      linkedin: 'https://www.linkedin.com/in/jlabe280/',
      notes: 'Email verified via RocketReach/ContactOut. Pioneer of venture leasing/lending. Menlo Park-based. Chicago Booth MBA.',
      status: 'Enriched'
    },
    {
      row: 908, // Muse Capital
      contactName: 'Assia Grazioli-Venier',
      title: 'Co-Founder & Managing Partner',
      email: 'assia@musecapital.vc',
      linkedin: 'https://www.linkedin.com/in/assia/',
      notes: 'Email verified via RocketReach/Adapt. Consumer tech VC. Focus: healthcare, care/live/play companies. London Business School.',
      status: 'Enriched'
    }
  ];
  
  console.log('=== APPLYING ENRICHMENT UPDATES ===\n');
  
  for (const update of updates) {
    console.log(`Updating row ${update.row}: ${update.contactName} at ${update.email}`);
    
    // Update the specific row
    const range = `Sheet1!C${update.row}:K${update.row}`;
    const values = [[
      update.contactName,
      update.title,
      update.email,
      '', // Website column (skip)
      update.linkedin,
      '', // Sector Focus (preserve existing)
      update.notes,
      update.status,
      '' // Last Contacted (empty)
    ]];
    
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        resource: { values }
      });
      console.log(`✓ Successfully updated row ${update.row}\n`);
    } catch (error) {
      console.error(`✗ Error updating row ${update.row}:`, error.message, '\n');
    }
  }
  
  console.log('\n=== ENRICHMENT COMPLETE ===');
  console.log(`Total enriched: ${updates.length} leads`);
  console.log('Status: Enriched and ready for outreach');
  
  // Mark dead/skip entries
  const skipRows = [
    { row: 801, reason: 'Tennenbaum Capital Partners - Appears defunct/acquired' },
    { row: 909, reason: 'Backstroke - Not a PE firm, portfolio company' },
    { row: 910, reason: 'Satso - Not a PE firm' }
  ];
  
  console.log('\n=== MARKING INVALID ENTRIES ===');
  for (const skip of skipRows) {
    console.log(`Row ${skip.row}: ${skip.reason}`);
    
    const range = `Sheet1!J${skip.row}`;
    const values = [['Dead - Not PE/VC firm']];
    
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        resource: { values }
      });
      console.log(`✓ Marked as dead\n`);
    } catch (error) {
      console.error(`✗ Error:`, error.message, '\n');
    }
  }
  
  return updates;
}

applyEnrichment()
  .then(() => console.log('\nAll updates applied successfully!'))
  .catch(console.error);
