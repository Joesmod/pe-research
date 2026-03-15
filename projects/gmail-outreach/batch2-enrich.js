const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const credentials = JSON.parse(fs.readFileSync('service-account.json', 'utf8'));
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

// Batch 2: 11 more enrichments from web research
const enrichments = [
  {
    row: 33,
    firm: 'Nautic Partners',
    contactName: 'Jim Beakey',
    title: 'Managing Director, Business Development',
    email: 'jbeakey@nautic.com',
    linkedin: 'https://www.linkedin.com/in/jim-beakey',
    notes: 'Email & phone verified from official contact page https://nautic.com/contact/corporate/ - (401) 278-5678 (2026-03-14 cron)',
    status: 'Enriched'
  },
  {
    row: 75,
    firm: 'Blue Point Capital Partners',
    contactName: 'Chip Chaikin',
    title: 'Partner',
    email: 'cchaikin@bluepointcapital.com',
    linkedin: '',
    notes: 'Verified from official team page https://www.bluepointcapital.com/our-team/chip-chaikin - Cleveland office (2026-03-14 cron)',
    status: 'Enriched'
  },
  {
    row: 71,
    firm: 'Berkshire Partners',
    contactName: 'Ben Levy',
    title: 'Managing Director',
    email: 'blevy@berkshirepartners.com',
    linkedin: '',
    notes: 'Email pattern FLast@berkshirepartners.com verified via RocketReach. Official team page at berkshirepartners.com/team (2026-03-14 cron)',
    status: 'Enriched'
  },
  {
    row: 57,
    firm: 'Trivest Partners',
    contactName: 'Troy D. Templeton',
    title: 'Managing Director',
    email: 'ttempleton@trivest.com',
    linkedin: '',
    notes: 'Managing Director per growth equity interview guide. General contact info@trivest.com, (305) 858-2200. Coral Gables, FL. (2026-03-14 cron)',
    status: 'Enriched - Needs Email Verification'
  },
  {
    row: 66,
    firm: 'Water Street Healthcare Partners',
    contactName: 'Tim Dugan',
    title: 'Founder',
    email: 'tdugan@waterstreet.com',
    linkedin: 'https://www.linkedin.com/in/tim-dugan/',
    notes: 'Founder verified from LinkedIn and press releases. Founded Water Street in 2005. Chicago-based. (2026-03-14 cron)',
    status: 'Enriched'
  },
  {
    row: 18,
    firm: 'Gryphon Investors',
    contactName: 'R. David Andrews',
    title: 'Founder & Co-CEO',
    email: 'dandrews@gryphon-inv.com',
    linkedin: 'https://www.linkedin.com/in/r-david-andrews',
    notes: 'Founder & Co-CEO verified from official bio https://www.gryphon-inv.com/team/david-andrews/ - founded 1995 (2026-03-14 cron)',
    status: 'Enriched'
  },
  {
    row: 32,
    firm: 'Parthenon Capital Partners',
    contactName: 'Brian Golson',
    title: 'Co-CEO and Managing Partner',
    email: 'bgolson@parthenoncapital.com',
    linkedin: '',
    notes: 'Co-CEO per Crunchbase. Phone +1 415 913 3900. Boston HQ. Email pattern verified. (2026-03-14 cron)',
    status: 'Enriched - Needs Email Verification'
  },
  {
    row: 28,
    firm: 'Seidler Equity Partners',
    contactName: 'Robert Seidler',
    title: 'Co-Founder & Managing Partner',
    email: 'rseidler@sepfunds.com',
    linkedin: '',
    notes: 'Co-Founder verified from TheOrg and official website sepfunds.com. Founded 1992. Marina Del Rey, CA. (2026-03-14 cron)',
    status: 'Enriched - Needs Email Verification'
  },
  {
    row: 27,
    firm: 'Roark Capital Group',
    contactName: 'Neal K. Aronson',
    title: 'Founder & Managing Partner',
    email: 'naronson@roarkcapital.com',
    linkedin: '',
    notes: 'Founder per Wikipedia, founded 2001. Atlanta, GA. 1180 Peachtree St NE. Email pattern standard. (2026-03-14 cron)',
    status: 'Enriched - Needs Email Verification'
  },
  {
    row: 23,
    firm: 'HGGC',
    contactName: 'John Fitzgerald',
    title: 'Managing Director & Co-Founder',
    email: 'jfitzgerald@hggc.com',
    linkedin: '',
    notes: 'Managing Director & Co-Founder. Email pattern standard (firstname.lastname or flast). Needs verification. (2026-03-14 cron)',
    status: 'Enriched - Needs Email Verification'
  },
  {
    row: 56,
    firm: 'WindRose Health Investors',
    contactName: 'Michael Benezra',
    title: 'Managing Partner',
    email: 'mbenezra@windrosehealthinvestors.com',
    linkedin: '',
    notes: 'Healthcare-focused PE firm. Email pattern standard. Needs verification via official source. (2026-03-14 cron)',
    status: 'Enriched - Needs Email Verification'
  }
];

async function updateSheet() {
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  
  console.log('Batch 2: Updating sheet with 11 more enrichments...\n');
  
  for (const enrich of enrichments) {
    console.log(`Row ${enrich.row}: ${enrich.firm}`);
    console.log(`  ${enrich.contactName} (${enrich.title})`);
    console.log(`  ${enrich.email}`);
    console.log(`  Status: ${enrich.status}`);
    
    const updates = [];
    
    updates.push({ range: `Sheet1!C${enrich.row}`, values: [[enrich.contactName]] });
    updates.push({ range: `Sheet1!D${enrich.row}`, values: [[enrich.title]] });
    updates.push({ range: `Sheet1!E${enrich.row}`, values: [[enrich.email]] });
    if (enrich.linkedin) updates.push({ range: `Sheet1!G${enrich.row}`, values: [[enrich.linkedin]] });
    updates.push({ range: `Sheet1!I${enrich.row}`, values: [[enrich.notes]] });
    updates.push({ range: `Sheet1!H${enrich.row}`, values: [[enrich.status]] });
    
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      resource: {
        data: updates,
        valueInputOption: 'RAW'
      }
    });
    
    console.log('  ✓ Updated\n');
  }
  
  console.log(`\n✅ Batch 2 complete: ${enrichments.length} leads enriched`);
  console.log(`\n📊 TOTAL ENRICHED THIS RUN: ${enrichments.length + 4} leads (4 in Batch 1 + 11 in Batch 2)`);
}

updateSheet().catch(console.error);
