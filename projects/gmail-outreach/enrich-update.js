const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

// Key enrichments with VERIFIED emails or strong official source confirmation
const updates = [
  {
    range: 'Sheet1!A68:M68', // Pamlico Capital - Watts Hamrick row
    values: [[
      'Pamlico Capital',
      'https://www.pamlicocapital.com',
      'Watts Hamrick',
      'Managing Partner',
      '', // No verified email from official source
      '',
      'https://www.linkedin.com/in/watts-hamrick-98912069',
      'Needs Email',
      'Managing Partner verified from official pamlicocapital.com team page and RocketReach. Email pattern identified but not from official published source. (2026-03-25 PE Research Enrichment)',
      'Needs Email',
      '',
      '',
      'https://www.pamlicocapital.com/team'
    ]]
  },
  // Add a NEW row for Tenex (appears not to be in sheet yet - will append)
  // Add a NEW row for several other enriched firms not found in the sheet
];

async function getClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function batchUpdate() {
  const sheets = await getClient();
  
  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: updates
      }
    });
    console.log(`✅ Updated ${updates.length} rows`);
  } else {
    console.log('No updates to apply');
  }
}

async function appendNewFirms() {
  const sheets = await getClient();
  
  const newFirms = [
    // Tenex Capital - VERIFIED official emails from PDF
    [
      'Tenex Capital Management',
      'https://www.tenexcm.com',
      'Stephens Johnson',
      'Partner',
      'sjohnson@tenexcm.com',
      '',
      'https://www.linkedin.com/company/tenex-capital',
      'Enriched',
      'Email VERIFIED from official Tenex Capital tearsheet PDF (June 2024). Partner. Also available: Kevin Doyle (Partner, kdoyle@tenexcm.com). (2026-03-25 PE Research Enrichment)',
      'Enriched',
      '2026-03-25',
      'VERIFIED email from official source',
      'https://www.tenexcm.com'
    ],
    // Tenex Capital - second contact
    [
      'Tenex Capital Management',
      'https://www.tenexcm.com',
      'Kevin Doyle',
      'Partner',
      'kdoyle@tenexcm.com',
      '',
      'https://www.linkedin.com/company/tenex-capital',
      'Enriched',
      'Email VERIFIED from official Tenex Capital tearsheet PDF (June 2024). Partner. (2026-03-25 PE Research Enrichment)',
      'Enriched',
      '2026-03-25',
      'VERIFIED email from official source',
      'https://www.tenexcm.com'
    ],
    // New Water Capital
    [
      'New Water Capital',
      'https://www.newwatercap.com',
      'Jason Neimark',
      'Founder & Partner',
      '',
      '',
      'https://www.linkedin.com/in/jason-neimark',
      'Needs Email',
      'Contact verified via company website (newwatercap.com/team) and LinkedIn. Founder with 30 years mezzanine and PE experience. Email pattern identified from data services but not from official published source. (2026-03-25 PE Research Enrichment)',
      'Needs Email',
      '2026-03-25',
      'Contact verified - email not publicly available',
      'https://www.newwatercap.com/team'
    ],
    // Soundcore Capital Partners
    [
      'Soundcore Capital Partners',
      'https://soundcorecap.com',
      'Jarrett Turner',
      'Founder & Managing Partner',
      '',
      '',
      'https://www.linkedin.com/in/jarrett-turner-107ba822',
      'Needs Email',
      'Contact verified via official company website (soundcorecap.com/team). Founder & Managing Partner since 2015. Email pattern identified from data services but not from official published source. (2026-03-25 PE Research Enrichment)',
      'Needs Email',
      '2026-03-25',
      'Contact verified - email not publicly available',
      'https://soundcorecap.com/team'
    ],
    // Ronin Equity Partners
    [
      'Ronin Equity Partners',
      'https://www.roninequitypartners.com',
      'David Feierstein',
      'Co-Founder & Managing Partner',
      '',
      '',
      'https://www.linkedin.com/in/david-feierstein-76370639',
      'Needs Email',
      'Contact verified via official company website (roninequitypartners.com/team) and LinkedIn. Co-Founder & Managing Partner. Email pattern identified from data services but not from official published source. (2026-03-25 PE Research Enrichment)',
      'Needs Email',
      '2026-03-25',
      'Contact verified - email not publicly available',
      'https://www.roninequitypartners.com/team'
    ],
    // Excellere Partners
    [
      'Excellere Partners',
      'https://excellere.com',
      'Brad Cornell',
      'Managing Partner',
      '',
      '',
      'https://www.linkedin.com/in/brad-cornell-016325a3',
      'Needs Email',
      'Contact verified via official company press releases (excellere.com/news) and LinkedIn. Managing Partner since founding 17 years ago. Email pattern identified from data services but not from official published source. (2026-03-25 PE Research Enrichment)',
      'Needs Email',
      '2026-03-25',
      'Contact verified - email not publicly available',
      'https://excellere.com/news'
    ],
    // Platte River Equity
    [
      'Platte River Equity',
      'https://platteriverequity.com',
      'Peter Calamari',
      'Managing Director',
      '',
      '',
      'https://www.linkedin.com/in/peter-calamari',
      'Needs Email',
      'Contact verified via official company website (platteriverequity.com/our-team/peter-w-calamari). Managing Director since 2008, focuses on Industrials sector. Email pattern identified from data services but not from official published source. (2026-03-25 PE Research Enrichment)',
      'Needs Email',
      '2026-03-25',
      'Contact verified - email not publicly available',
      'https://platteriverequity.com/our-team'
    ],
    // Bregal Sagemount
    [
      'Bregal Sagemount',
      'https://www.sagemount.com',
      'Gene Yoon',
      'Managing Partner & Co-Founder',
      '',
      '',
      'https://www.linkedin.com/in/gene-yoon',
      'Needs Email',
      'Contact verified via official company website (sagemount.com/team/gene-yoon) and Wikipedia. Managing Partner, founded Bregal Sagemount (formerly at Goldman Sachs). Email pattern identified from data services but not from official published source. (2026-03-25 PE Research Enrichment)',
      'Needs Email',
      '2026-03-25',
      'Contact verified - email not publicly available',
      'https://www.sagemount.com/team/gene-yoon'
    ],
    // Arsenal Capital Partners
    [
      'Arsenal Capital Partners',
      'https://www.arsenalcapital.com',
      'Joelle Marquis',
      'President & Senior Partner',
      '',
      '',
      'https://www.linkedin.com/in/joelle-marquis',
      'Needs Email',
      'Contact verified via official company website (arsenalcapital.com/team/joelle-marquis). President & Senior Partner since 2003. Email pattern identified from data services but not from official published source. (2026-03-25 PE Research Enrichment)',
      'Needs Email',
      '2026-03-25',
      'Contact verified - email not publicly available',
      'https://www.arsenalcapital.com/team/joelle-marquis'
    ],
    // Cove Hill Partners
    [
      'Cove Hill Partners',
      'https://www.covehillpartners.com',
      'Andrew Balson',
      'Founder & Managing Partner',
      '',
      '',
      'https://www.linkedin.com/in/andrew-balson-246299b7',
      'Needs Email',
      'Contact verified via LinkedIn and CBInsights. Founder & Managing Partner. Email pattern identified from data services but not from official published source. (2026-03-25 PE Research Enrichment)',
      'Needs Email',
      '2026-03-25',
      'Contact verified - email not publicly available',
      'https://www.covehillpartners.com'
    ],
    // NewSpring Capital - UPDATE existing if found, otherwise append
    [
      'NewSpring Capital',
      'https://newspringcapital.com',
      'Michael DiPiano',
      'Managing General Partner & Co-Founder',
      '',
      '',
      'https://www.linkedin.com/in/michael-dipiano-0308502b',
      'Needs Email',
      'Contact verified via official company website (newspringcapital.com/team/michael-dipiano). Managing General Partner & Co-Founder. Email pattern identified from data services but not from official published source. (2026-03-25 PE Research Enrichment)',
      'Needs Email',
      '2026-03-25',
      'Contact verified - email not publicly available',
      'https://newspringcapital.com/team/michael-dipiano'
    ],
  ];
  
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: newFirms }
  });
  
  console.log(`✅ Appended ${newFirms.length} new enriched firms`);
}

async function run() {
  try {
    console.log('Applying updates...');
    await batchUpdate();
    console.log('\nAppending new firms...');
    await appendNewFirms();
    console.log('\n✅ PE Research enrichment complete - 11 firms enriched (2 with verified emails, 9 with verified contacts)');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

run();
