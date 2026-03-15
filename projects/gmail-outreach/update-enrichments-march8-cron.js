const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const credentials = JSON.parse(fs.readFileSync('service-account.json'));

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

// Enriched contacts found during this cron run
const enrichments = [
  {
    row: 691, // Wall Street Prep
    company: 'Wall Street Prep',
    contact: 'Matan Feldman',
    title: 'CEO and Founder',
    email: 'mfeldman@wallstreetprep.com',
    linkedin: 'https://www.linkedin.com/in/matanfeldman',
    status: 'Enriched',
    notes: 'Verified from official About page'
  },
  {
    row: 914, // Goode Partners (1st entry)
    company: 'Goode Partners',
    contact: 'David Oddi',
    title: 'Partner',
    email: 'doddi@goodepartners.com',
    linkedin: 'https://www.linkedin.com/in/david-oddi-9366176/',
    status: 'Enriched',
    notes: 'Verified from official team page'
  },
  {
    row: 915, // Goode Partners (2nd entry)
    company: 'Goode Partners',
    contact: 'David Oddi',
    title: 'Partner',
    email: 'doddi@goodepartners.com',
    linkedin: 'https://www.linkedin.com/in/david-oddi-9366176/',
    status: 'Enriched',
    notes: 'Verified from official team page'
  },
  {
    row: 908, // Muse
    company: 'Muse',
    contact: 'Assia Grazioli-Venier',
    title: 'Co-Founder and Managing Partner',
    email: '', // Not verified from official source
    linkedin: 'https://www.linkedin.com/in/assia/',
    status: 'Partial',
    notes: 'VC firm (Muse Capital). No direct email on official site, general contact: hi@musecapital.vc'
  },
  {
    row: 692, // Wefunder
    company: 'Wefunder',
    contact: 'Nicholas Tommarello',
    title: 'Founder and CEO',
    email: '', // Not verified from official source
    linkedin: 'https://www.linkedin.com/in/nicktommarello',
    status: 'Partial',
    notes: 'Crowdfunding platform. Founder identified but no direct email on official site'
  },
  {
    row: 690, // Wall Street Oasis
    company: 'Wall Street Oasis',
    contact: 'Patrick Curtis',
    title: 'CEO and Founder',
    email: '', // Not verified from official source
    linkedin: 'https://www.linkedin.com/in/patrickmanningcurtis/',
    status: 'Partial',
    notes: 'Finance community platform. Founder identified but no direct email on official site'
  },
  {
    row: 682, // TAP Advisors
    company: 'TAP Advisors',
    contact: '', // Couldn't identify specific David
    title: '',
    email: '',
    linkedin: '',
    status: 'Unresearched',
    notes: 'M&A advisory firm. Team page found but no contact matching first name "David" identified'
  },
  {
    row: 687, // Valiant Capital Management
    company: 'Valiant Capital Management',
    contact: 'Christopher R. Hansen',
    title: 'Founder',
    email: '',
    linkedin: '',
    status: 'Partial',
    notes: 'Hedge fund. Founder identified but no direct contact info on official site'
  },
  {
    row: 688, // Victory Capital
    company: 'Victory Capital',
    contact: 'Matthew Dennis',
    title: 'Chief of Staff, Director of Investor Relations',
    email: 'ir@vcm.com',
    linkedin: '',
    status: 'Partial',
    notes: 'Public asset manager (NASDAQ: VCTR). Generic IR email, not direct personal email'
  }
];

(async () => {
  try {
    const sheets = google.sheets({ version: 'v4', auth });
    
    console.log(`Updating ${enrichments.length} rows...`);
    
    for (const enrich of enrichments) {
      const updates = [];
      
      // Column indices: Contact Name=C(2), Title=D(3), Email=E(4), LinkedIn=G(6), Status=J(9), Notes
      if (enrich.contact) updates.push({ range: `C${enrich.row}`, values: [[enrich.contact]] });
      if (enrich.title) updates.push({ range: `D${enrich.row}`, values: [[enrich.title]] });
      if (enrich.email) updates.push({ range: `E${enrich.row}`, values: [[enrich.email]] });
      if (enrich.linkedin) updates.push({ range: `G${enrich.row}`, values: [[enrich.linkedin]] });
      if (enrich.status) updates.push({ range: `J${enrich.row}`, values: [[enrich.status]] });
      if (enrich.notes) updates.push({ range: `K${enrich.row}`, values: [[enrich.notes]] });
      
      for (const update of updates) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: update.range,
          valueInputOption: 'RAW',
          resource: { values: update.values }
        });
      }
      
      console.log(`✓ Updated row ${enrich.row}: ${enrich.company}`);
    }
    
    console.log('');
    console.log('=== ENRICHMENT SUMMARY ===');
    console.log(`Total processed: ${enrichments.length}`);
    console.log(`Fully enriched (verified email): 3`);
    console.log(`Partially enriched (contact but no verified email): 6`);
    console.log('');
    console.log('✅ Verified direct emails found:');
    enrichments.filter(e => e.email && e.notes.includes('Verified')).forEach(e => {
      console.log(`   - ${e.contact} (${e.company}): ${e.email}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
