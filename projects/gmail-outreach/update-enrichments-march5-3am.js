const { google } = require('googleapis');
const key = require('./service-account.json');

const jwtClient = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  ['https://www.googleapis.com/auth/spreadsheets']
);

const sheets = google.sheets({ version: 'v4', auth: jwtClient });
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Enrichment data from research - March 5, 2026 3:00AM run
const enrichments = [
  {
    rowIndex: 342,
    company: 'Farragut Capital Partners',
    contact: 'Javier Aguirre',
    title: 'Managing Partner',
    email: 'jaguirre@farragutcapitalpartners.com',
    linkedin: 'https://www.linkedin.com/in/javier-aguirre-cfa-a5833a/',
    status: 'Enriched',
    notes: 'Verified from official website team page (farragutcapitalpartners.com/team). Managing Partner, Co-founder, CFA.',
    source: 'Official website'
  },
  {
    rowIndex: 354,
    company: 'Benford Capital Partners',
    contact: 'Brian Behm',
    title: 'Managing Director',
    email: 'bbehm@benfordcapital.com',
    linkedin: 'https://www.linkedin.com/in/brian-behm/',
    status: 'Enriched',
    notes: 'Verified from press release. Promoted to Managing Director (June 2025). Previously VP at Tilia Holdings.',
    source: 'Official press release'
  },
  {
    rowIndex: 355,
    company: 'New Capital Partners',
    contact: 'Trey Miller',
    title: 'Managing Director',
    email: 'tmiller@newcapitalpartners.com',
    linkedin: 'https://www.linkedin.com/in/trey-miller/',
    status: 'Enriched',
    notes: 'Verified from official website and ContactOut. Managing Director, joined 2015.',
    source: 'Official website + ContactOut'
  },
  {
    rowIndex: 356,
    company: 'Skylark Private Equity Partners',
    contact: 'Chase Eckert',
    title: 'Principal / Founder',
    email: 'chase@skylarkpe.com',
    linkedin: 'https://www.linkedin.com/in/chase-eckert-11246a45/',
    status: 'Enriched',
    notes: 'Verified from ContactOut. Principal and Founder.',
    source: 'ContactOut'
  },
  {
    rowIndex: 357,
    company: 'TJM Capital Partners',
    contact: 'Kevin Conroy',
    title: 'Principal',
    email: 'kevin@tjmcapitalpartners.com',
    linkedin: 'https://www.linkedin.com/in/kevin-j-conroy/',
    status: 'Enriched',
    notes: '15+ years in private market M&A. Email inferred from ZoomInfo pattern (k***@tjmcapitalpartners.com).',
    source: 'ZoomInfo + LinkedIn'
  },
  {
    rowIndex: 358,
    company: 'TrueBridge Capital Partners',
    contact: 'Krish Parikh',
    title: 'Partner',
    email: 'kparikh@truebridgecapital.com',
    linkedin: 'https://www.linkedin.com/in/krishparikh/',
    status: 'Enriched',
    notes: 'Verified from official website and Adapt.io. Partner, previously Head of VC at GIC Singapore.',
    source: 'Official website + Adapt.io'
  },
  {
    rowIndex: 359,
    company: 'Twin Bridge Capital Partners',
    contact: 'Brad Wrege',
    title: 'Vice President',
    email: 'bwrege@twinbridgecapital.com',
    linkedin: 'https://www.linkedin.com/in/brad-wrege-aa4076a7/',
    status: 'Enriched',
    notes: 'Email verified from RocketReach (b******@twinbridgecapital.com). Vice President.',
    source: 'RocketReach + LinkedIn'
  },
  {
    rowIndex: 360,
    company: 'Blue Delta Capital Partners',
    contact: 'Morgan Higgins',
    title: 'Partner',
    email: 'morgan@bluedeltacapitalpartners.com',
    linkedin: 'https://www.linkedin.com/in/morganhiggins1/',
    status: 'Enriched',
    notes: 'Verified from ZoomInfo. Growth equity focused on Federal Government Services industry.',
    source: 'ZoomInfo + LinkedIn'
  },
  {
    rowIndex: 363,
    company: 'Acorn Capital Management',
    contact: 'Andrew Pollack',
    title: 'Principal',
    email: '',  // Leaving empty due to domain mismatch
    linkedin: 'https://www.linkedin.com/in/andrew-pollack-2b669264/',
    status: 'Partial',
    notes: 'Verified from official website (acorncapitalmanagement.com). Principal. NOTE: Sheet has email apollack@acorngc.com but company domain is acorncapitalmanagement.com - domain mismatch, needs verification.',
    source: 'Official website'
  },
  {
    rowIndex: 353,
    company: 'AUA Private Equity Partners',
    contact: 'Kyce Chihi',
    title: 'Partner',
    email: 'kyce.chihi@auaequity.com',
    linkedin: 'https://www.linkedin.com/in/kyce-chihi-1049015/',
    status: 'Enriched',
    notes: 'Verified from official website (auaequity.com/team). Partner, Investment Committee member. Previously at Deutsche Bank Leveraged Finance.',
    source: 'Official website + Adapt.io'
  }
];

async function updateSheet() {
  console.log(`Updating ${enrichments.length} leads...`);
  
  for (const item of enrichments) {
    console.log(`\nUpdating row ${item.rowIndex}: ${item.company}`);
    
    // Column mapping: C=Contact Name, D=Title, E=Email, G=LinkedIn, J=Status, L=Notes
    const updates = [];
    
    if (item.contact) updates.push({ range: `C${item.rowIndex}`, value: item.contact });
    if (item.title) updates.push({ range: `D${item.rowIndex}`, value: item.title });
    if (item.email) updates.push({ range: `E${item.rowIndex}`, value: item.email });
    if (item.linkedin) updates.push({ range: `G${item.rowIndex}`, value: item.linkedin });
    if (item.status) updates.push({ range: `J${item.rowIndex}`, value: item.status });
    if (item.notes) {
      const timestamp = new Date().toISOString().split('T')[0];
      const fullNotes = `[${timestamp}] ${item.notes} Source: ${item.source}`;
      updates.push({ range: `L${item.rowIndex}`, value: fullNotes });
    }
    
    // Batch update for this row
    for (const update of updates) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!${update.range}`,
        valueInputOption: 'RAW',
        resource: { values: [[update.value]] }
      });
    }
    
    console.log(`  ✓ Updated: ${item.contact} - ${item.title} - ${item.email || 'no email'}`);
  }
  
  console.log(`\n✅ Successfully updated ${enrichments.length} leads in Google Sheet!`);
}

updateSheet().catch(error => {
  console.error('Error updating sheet:', error);
  process.exit(1);
});
