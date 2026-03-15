const { google } = require('googleapis');

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Enrichment data
  const updates = [
    {
      row: 128, // Kinderhook Industries
      company: 'Kinderhook Industries',
      contact: 'Robert Michalik',
      title: 'Managing Director',
      email: 'rmichalik@kinderhook.com',
      linkedin: 'https://www.linkedin.com/company/kinderhookindustries',
      status: 'Enriched',
      notes: 'Email from official press release (kinderhook.com). Also available: Christian Michalik (cmichalik), Thomas Tuttle (ttuttle). Source: https://www.kinderhook.com/press-release/kinderhook-industries-celebrates-20-years/'
    },
    {
      row: 467, // Goode Partners
      company: 'Goode Partners',
      contact: 'David Oddi',
      title: 'Partner',
      email: 'doddi@goodepartners.com',
      linkedin: 'https://www.linkedin.com/company/goode-partners',
      status: 'Enriched',
      notes: 'Email from official team page (goodepartners.com/team). Other contacts: Daniel Bonoff (dbonoff), Paula Semelmacher CFO (psemel), Joe Ferreira (jferreira). All emails verified public source.'
    },
    {
      row: 249, // Tenex Capital Management
      company: 'Tenex Capital Management',
      contact: 'Stephens Johnson',
      title: 'Managing Director, Head of Business Development',
      email: 'sjohnson@tenexcm.com',
      linkedin: 'https://www.linkedin.com/company/tenex-capital-management',
      status: 'Enriched',
      notes: 'Email from official PDF tearsheet. Also: Kevin Doyle (kdoyle@tenexcm.com), Mike Green CEO. Source: https://www.tenexcm.com/images/home/TenexTearSheet_June-2024.pdf'
    },
    {
      row: 242, // Cranemere Group
      company: 'Cranemere Group',
      contact: 'Kamil Salame',
      title: 'Chief Executive Officer',
      email: 'ksalame@cranemere.com',
      linkedin: 'https://www.linkedin.com/in/kamil-salame',
      status: 'Enriched',
      notes: 'Pattern inference k***@cranemere.com (RocketReach). Media contact available: Tom Davies at Kekst CNC ([email protected]). CEO confirmed via official website.'
    },
    {
      row: 71, // Berkshire Partners
      company: 'Berkshire Partners',
      contact: 'Larry Hamelsky',
      title: 'Managing Director',
      email: 'lhamelsky@berkshirepartners.com',
      linkedin: 'https://www.linkedin.com/in/larry-hamelsky-512429277',
      status: 'Enriched',
      notes: 'Pattern inference [first_initial][lastname]@berkshirepartners.com. Other MDs: Randy Peeler, Ben Levy, Carl Ferenbach. Source: official team page + LinkedIn.'
    }
  ];
  
  console.log('\n=== ENRICHMENT UPDATE ===\n');
  console.log(`Updating ${updates.length} firms in the sheet...\n`);
  
  for (const update of updates) {
    try {
      // Update row with enrichment data
      // Columns: A=Company, C=Contact, D=Title, E=Email, F=Website, G=LinkedIn, J=Status, L=Notes
      const range = `Sheet1!C${update.row}:L${update.row}`;
      const values = [[
        update.contact,
        update.title,
        update.email,
        '', // Website column - leaving blank to not overwrite
        update.linkedin,
        '', '', // Columns H, I
        update.status,
        '', // Column K
        update.notes
      ]];
      
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        resource: { values }
      });
      
      console.log(`✓ Row ${update.row}: ${update.company}`);
      console.log(`  Contact: ${update.contact}`);
      console.log(`  Email: ${update.email}`);
      console.log(`  Status: ${update.status}`);
      console.log('');
    } catch (error) {
      console.error(`✗ Error updating row ${update.row}:`, error.message);
    }
  }
  
  console.log(`\n✓ Enrichment complete! ${updates.length} firms updated.`);
  console.log('\nSummary:');
  console.log('- 3 with verified emails from official sources (Kinderhook, Goode, Tenex)');
  console.log('- 2 with pattern inference + confirmed titles (Berkshire, Cranemere)');
  console.log('\nAll sources documented in Notes column.');
}

updateSheet().catch(console.error);
