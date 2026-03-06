const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = JSON.parse(fs.readFileSync('service-account.json'));

const auth = new google.auth.GoogleAuth({
  credentials: SERVICE_ACCOUNT,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

const updates = [
  {
    row: 51,
    company: 'Genstar Capital',
    contact: 'Ryan Clark',
    title: 'President & Managing Director',
    linkedin: 'https://www.linkedin.com/in/ryan-clark-60389/',
    website: 'https://www.gencap.com/',
    status: 'Researched - Awaiting Email Enrichment',
    notes: 'Verified via official Genstar press release and team references. President since 2015.'
  },
  {
    row: 154,
    company: 'Thoma Bravo',
    contact: 'Orlando Bravo',
    title: 'Founder & Managing Partner',
    linkedin: 'https://www.linkedin.com/in/orlandobravo/',
    website: 'https://www.thomabravo.com/team/orlando-bravo',
    status: 'Researched - Awaiting Email Enrichment',
    notes: 'Verified via official Thoma Bravo team page. Founder and managing partner.'
  },
  {
    row: 168,
    company: 'Clearlake Capital Group',
    contact: 'Behdad Eghbali',
    title: 'Co-Founder & Managing Partner',
    linkedin: 'https://www.linkedin.com/in/behdad-eghbali-ba645/',
    website: 'https://www.clearlake.com',
    status: 'Researched - Awaiting Email Enrichment',
    notes: 'Verified via Forbes, Wikipedia, official sources. Co-founded Clearlake in 2006.'
  },
  {
    row: 696,
    company: '3G Capital',
    contact: 'Alex Behring',
    title: 'Co-Founder & Co-Managing Partner',
    linkedin: 'https://www.linkedin.com/in/alex-behring-72678424/',
    website: 'https://www.3g-capital.com/',
    status: 'Researched - Awaiting Email Enrichment',
    notes: 'Verified via official 3G Capital website. Co-founder and co-managing partner.'
  },
  {
    row: 728,
    company: 'Sageview Capital',
    contact: 'Ned Gilhuly',
    title: 'Co-Founder & Partner',
    linkedin: 'https://www.linkedin.com/in/ned-gilhuly/',
    website: 'https://www.sageviewcapital.com/team/ned-gilhuly/',
    status: 'Researched - Awaiting Email Enrichment',
    notes: 'Verified via official Sageview team page. Extensive bio available. Former KKR partner 19 years.'
  },
  {
    row: 730,
    company: 'Peak Rock Capital',
    contact: 'Anthony DiSimone',
    title: 'Chief Executive Officer',
    linkedin: '(multiple profiles - needs verification)',
    website: 'https://www.peakrockcapital.com/team-info/anthony-disimone',
    status: 'Researched - Awaiting Email Enrichment',
    notes: 'Verified via official Peak Rock team page. CEO of firm.'
  },
  {
    row: 734,
    company: 'Wynnchurch Capital',
    contact: 'Greg Gleason',
    title: 'Managing Partner',
    linkedin: 'https://www.linkedin.com/in/greg-gleason-5468848/',
    website: 'https://www.wynnchurch.com/team/gleason-greg',
    status: 'Researched - Awaiting Email Enrichment',
    notes: 'Verified via official Wynnchurch team page. Joined firm in 2008.'
  },
  {
    row: 940,
    company: 'Monroe Capital',
    contact: 'Theodore Koenig',
    title: 'Chairman & CEO',
    linkedin: 'https://www.linkedin.com/in/theodore-koenig/',
    website: 'https://monroecap.com/team_member/theodore-l-koenig/',
    status: 'Researched - Awaiting Email Enrichment',
    notes: 'Verified via official Monroe Capital team page. Founder, Chairman & CEO. Current email (info@) is generic.'
  },
  {
    row: 862,
    company: 'The Riverside Company',
    contact: 'Béla Szigethy',
    title: 'Co-CEO',
    linkedin: '(available)',
    website: 'https://www.riversidecompany.com/team/bela-szigethy-stewart-kohl/',
    status: 'Researched - Awaiting Email Enrichment',
    notes: 'Verified via official Riverside team page. Co-CEO, founded Riverside in 1988.'
  }
];

async function updateSheet() {
  try {
    console.log('Updating Google Sheet with enrichment research...\n');
    
    const columnMap = {
      A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9, J: 10, K: 11, L: 12
    };
    // Assuming: A=Company, B=Contact, C=Title, D=Email, E=LinkedIn, F=Website, G=Status, H=Notes
    
    for (const update of updates) {
      console.log(`Updating row ${update.row}: ${update.company} - ${update.contact}`);
      
      const updates = [
        { range: `Sheet1!B${update.row}`, values: [[update.contact]] },
        { range: `Sheet1!C${update.row}`, values: [[update.title || '']] },
        { range: `Sheet1!E${update.row}`, values: [[update.linkedin || '']] },
        { range: `Sheet1!F${update.row}`, values: [[update.website || '']] },
        { range: `Sheet1!G${update.row}`, values: [[update.status || '']] },
        { range: `Sheet1!H${update.row}`, values: [[update.notes || '']] }
      ];
      
      for (const upd of updates) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: upd.range,
          valueInputOption: 'USER_ENTERED',
          resource: { values: upd.values }
        });
      }
      
      console.log(`  ✓ Updated row ${update.row}`);
    }
    
    console.log(`\n✅ Successfully updated ${updates.length} firms in the sheet.`);
    console.log('\nNext step: Run Apollo API enrichment to find direct emails.');
    
  } catch (error) {
    console.error('Error updating sheet:', error.message);
    process.exit(1);
  }
}

updateSheet();
