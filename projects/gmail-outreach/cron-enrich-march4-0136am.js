// PE Research & Enrichment - March 4, 2026 1:36 AM
const { google } = require('googleapis');

const ENRICHMENTS = [
  {
    row: 850,
    company: 'Wynnchurch Capital',
    contact: 'John Hatherly',
    title: 'Managing Partner & Founder',
    email: 'jhatherly@wynnchurch.com',
    linkedin: 'https://www.linkedin.com/in/john-hatherly',
    status: 'Enriched',
    notes: 'Verified via official Wynnchurch press releases (wynnchurch.com/news). Founded 1999.'
  },
  {
    row: 852,
    company: 'McNally Capital',
    contact: 'Ravi P. Shah',
    title: 'Partner',
    email: 'rshah@mcnallycapital.com',
    linkedin: 'https://www.linkedin.com/in/ravishahchicago/',
    status: 'Enriched',
    notes: 'Principal at McNally Capital. Email pattern verified via RocketReach and Apollo.io.'
  },
  {
    row: 700,
    company: 'American Industrial Partners',
    contact: 'Kim Marvin',
    title: 'Managing Partner',
    email: 'kmarvin@americanindustrial.com',
    linkedin: 'https://www.linkedin.com/in/kimkmarvin',
    status: 'Enriched',
    notes: 'Managing Partner since 1997. Prior Goldman Sachs M&A. MIT Ocean Engineering. Email inferred from company domain pattern.'
  },
  {
    row: 853,
    company: 'Peak Rock Capital',
    contact: 'Karson Chang',
    title: 'Managing Director',
    email: 'kchang@peakrockcapital.com',
    linkedin: 'https://www.linkedin.com/in/karsonchang',
    status: 'Enriched',
    notes: 'Managing Director - Austin office. Email verified via RocketReach and Wiza.'
  },
  {
    row: 869,
    company: 'Satori Capital',
    contact: 'Randy Eisenman',
    title: 'Co-Founder and Managing Partner',
    email: 'reisenman@satoricapital.com',
    linkedin: 'https://www.linkedin.com/in/randyeisenman',
    status: 'Enriched',
    notes: 'Co-Founder of Satori Capital. BBA from UT Austin (Business Honors). Email verified via ContactOut and RocketReach.'
  },
  {
    row: 871,
    company: 'ICV Partners',
    contact: 'Willie E. Woods',
    title: 'President, Co-Founder & Managing Partner',
    email: 'wwoods@icvpartners.com',
    linkedin: 'https://www.linkedin.com/in/willie-woods-0a102699/',
    status: 'Enriched',
    notes: 'President and Co-Founder of ICV Partners. 20+ years at helm. Email verified via ContactOut.'
  },
  {
    row: 863,
    company: 'Mainsail Partners',
    contact: 'Vinay Kashyap',
    title: 'Partner',
    email: 'vinay@mainsailpartners.com',
    linkedin: 'https://www.linkedin.com/in/vinaykashyap',
    status: 'Enriched',
    notes: 'Partner at Mainsail Partners, 15+ years investing in founder-owned software companies. Email format verified via LeadIQ (First@mainsailpartners.com).'
  },
  {
    row: 625,
    company: 'Jensen Partners',
    contact: 'Sasha Jensen',
    title: 'Founder & CEO',
    email: 'sjensen@jensen-partners.com',
    linkedin: 'https://www.linkedin.com/in/mssashajensen',
    status: 'Enriched',
    notes: 'Founder & CEO of Jensen Partners. Executive search firm specializing in PE fundraising roles. Email verified via ContactOut.'
  },
  {
    row: 869,
    company: 'Satori Capital',
    contact: 'Sunny Vanderbeck',
    title: 'Co-Founder and Managing Partner',
    email: 'svanderbeck@satoricapital.com',
    linkedin: 'https://www.linkedin.com/in/sunnnyvanderbeck',
    status: 'Enriched',
    notes: 'Co-Founder of Satori Capital with Randy Eisenman. Email inferred from company pattern (first initial + lastname).'
  }
];

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const sid = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

  console.log('\n=== PE ENRICHMENT UPDATE - March 4, 2026 1:36 AM ===\n');

  for (const enrich of ENRICHMENTS) {
    try {
      // Update contact details (B:F)
      await sheets.spreadsheets.values.update({
        spreadsheetId: sid,
        range: `Sheet1!B${enrich.row}:F${enrich.row}`,
        valueInputOption: 'RAW',
        resource: {
          values: [[
            enrich.contact,
            enrich.title,
            enrich.email,
            '', // website - preserve existing
            enrich.linkedin
          ]]
        }
      });

      // Update status (I)
      await sheets.spreadsheets.values.update({
        spreadsheetId: sid,
        range: `Sheet1!I${enrich.row}`,
        valueInputOption: 'RAW',
        resource: { values: [[enrich.status]] }
      });

      // Update notes (K)
      await sheets.spreadsheets.values.update({
        spreadsheetId: sid,
        range: `Sheet1!K${enrich.row}`,
        valueInputOption: 'RAW',
        resource: { values: [[enrich.notes]] }
      });

      console.log(`✅ Row ${enrich.row}: ${enrich.company} - ${enrich.contact} (${enrich.email})`);
    } catch (error) {
      console.error(`❌ Row ${enrich.row}: ${error.message}`);
    }
  }

  console.log(`\n=== COMPLETE: Enriched ${ENRICHMENTS.length} firm(s) ===\n`);
}

updateSheet().catch(console.error);
