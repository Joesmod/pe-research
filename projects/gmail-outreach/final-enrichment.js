const { google } = require('googleapis');
const key = require('./service-account.json');

const auth = new google.auth.GoogleAuth({
  credentials: key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// All verified published emails from official sources
const enrichments = [
  {
    row: 787,
    company: 'Roark Capital',
    contact: 'Neal Aronson',
    title: 'Founder and Managing Partner',
    email: 'naronson@roarkcapital.com',
    linkedin: 'https://www.linkedin.com/in/neal-aronson/',
    notes: 'Source: Roark Capital official team page (verified)'
  },
  {
    row: 906,
    company: 'Great Range Capital',
    contact: 'Larry Flanagan',
    title: 'Team Member',
    email: 'larry.flanagan@greatrangecapital.com',
    linkedin: '',
    notes: 'Source: Great Range Capital website - community outreach page (verified)'
  },
  {
    row: 936,
    company: 'CapStreet',
    contact: 'Michelle A. Lewis',
    title: 'Principal and Head of Business Development',
    email: 'MLewis@capstreet.com',
    linkedin: '',
    notes: 'Source: CapStreet blog post (verified)'
  },
  {
    row: 793,
    company: 'Seaside Equity Partners',
    contact: 'Andrew Thompson',
    title: 'Managing Partner',
    email: 'andrew.thompson@seasideequity.com',
    linkedin: 'https://www.linkedin.com/in/andrew-thompson-70304b14/',
    notes: 'Source: Seaside Equity Partners official team page (verified)'
  },
  {
    row: 793, // Secondary contact for Seaside
    company: 'Seaside Equity Partners',
    contact: 'Navid Shirazi',
    title: 'Managing Director',
    email: 'navid.shirazi@seasideequity.com',
    linkedin: 'https://www.linkedin.com/in/navidshirazi/',
    notes: 'Source: Seaside Equity Partners official team page (verified)'
  },
  {
    row: 793, // Tertiary contact
    company: 'Seaside Equity Partners',
    contact: 'Hiral Pithadia',
    title: 'Managing Director',
    email: 'hiral.pithadia@seasideequity.com',
    linkedin: 'https://www.linkedin.com/in/hiral-pithadia-15b15b18',
    notes: 'Source: Seaside Equity Partners official team page (verified)'
  },
  {
    row: 794,
    company: 'Silver Oak Services Partners',
    contact: 'Daniel M. Gill',
    title: 'Managing Partner',
    email: '',
    linkedin: '',
    notes: 'Contact identified via Silver Oak team page & Crunchbase. Email not publicly available'
  },
  {
    row: 794, // Secondary
    company: 'Silver Oak Services Partners',
    contact: 'Gregory M. Barr',
    title: 'Managing Partner',
    email: '',
    linkedin: '',
    notes: 'Contact identified via Silver Oak team page. Email not publicly available'
  },
  {
    row: 790,
    company: 'Sageview Capital',
    contact: 'Ned Gilhuly',
    title: 'Co-Founder & Partner',
    email: '',
    linkedin: '',
    notes: 'Contact identified via Sageview official team page. Email not publicly available'
  },
  {
    row: 790, // Secondary
    company: 'Sageview Capital',
    contact: 'Scott Stuart',
    title: 'Co-Founder & Partner',
    email: '',
    linkedin: '',
    notes: 'Contact identified via Sageview official team page. Email not publicly available'
  },
  {
    row: 671,
    company: 'Seacoast Capital',
    contact: 'Jamie Donelan',
    title: 'Partner',
    email: '',
    linkedin: 'https://www.linkedin.com/in/jamiedonelan/',
    notes: 'Contact identified via Seacoast team page & LinkedIn. Email not publicly available'
  },
  {
    row: 867,
    company: 'Peak Rock Capital',
    contact: 'Anthony DiSimone',
    title: 'Chief Executive Officer',
    email: '',
    linkedin: '',
    notes: 'Contact identified via Peak Rock press releases & public sources. Email not publicly available'
  },
  {
    row: 891,
    company: 'Odyssey Investment Partners',
    contact: 'Brian Kwait',
    title: 'CEO',
    email: '',
    linkedin: '',
    notes: 'Contact identified via public sources. Email format: FLast@odysseyinvestment.com (not verified)'
  },
  {
    row: 935,
    company: 'Carousel Capital',
    contact: 'Peter L Clark',
    title: 'Partner',
    email: '',
    linkedin: '',
    notes: 'Contact identified via Tracxn. General contact: info@carouselcapital.com'
  },
  {
    row: 880,
    company: 'Arsenal Capital Partners',
    contact: '',  // No specific person identified with verified info
    title: '',
    email: 'careers@arsenalcapital.com',
    linkedin: '',
    notes: 'General HR email published on Arsenal website. Email format: [first_initial][last]@arsenalcapital.com (unverified pattern)'
  }
];

async function updateSheet() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:K'
  });
  
  const rows = res.data.values || [];
  console.log(`Total rows in sheet: ${rows.length}`);
  
  const updates = [];
  let enrichedCount = 0;
  let partialCount = 0;
  
  for (const enrich of enrichments) {
    const rowIdx = enrich.row - 1;
    if (rowIdx >= rows.length) continue;
    
    const currentRow = rows[rowIdx] || [];
    const newRow = [...currentRow];
    while (newRow.length < 11) newRow.push('');
    
    // Only update if we have meaningful contact info
    if (enrich.contact) {
      newRow[2] = enrich.contact;
    }
    if (enrich.title) {
      newRow[3] = enrich.title;
    }
    
    if (enrich.email && !enrich.email.startsWith('careers@') && !enrich.email.startsWith('info@')) {
      newRow[4] = enrich.email;
      newRow[9] = 'Enriched';
      enrichedCount++;
      console.log(`✅ [${enrich.row}] ${enrich.company} - ${enrich.contact} <${enrich.email}>`);
    } else if (enrich.contact) {
      // Clear generic emails if present
      if (newRow[4] && (newRow[4].startsWith('info@') || newRow[4].startsWith('sales@') || newRow[4].startsWith('ir@'))) {
        newRow[4] = enrich.email || '';
      }
      newRow[9] = 'Partial';
      partialCount++;
      console.log(`⚠️  [${enrich.row}] ${enrich.company} - ${enrich.contact} (no verified email)`);
    } else {
      console.log(`ℹ️  [${enrich.row}] ${enrich.company} - generic contact only`);
    }
    
    if (enrich.linkedin) newRow[6] = enrich.linkedin;
    newRow[10] = enrich.notes;
    
    updates.push({
      range: `Sheet1!A${enrich.row}:K${enrich.row}`,
      values: [newRow]
    });
  }
  
  if (updates.length > 0) {
    console.log(`\n\nApplying ${updates.length} updates to spreadsheet...`);
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      resource: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
    console.log('✅ Sheet updated successfully');
  }
  
  console.log(`\n📊 ENRICHMENT SUMMARY:`);
  console.log(`  ${enrichedCount} fully enriched (contact + verified email)`);
  console.log(`  ${partialCount} partially enriched (contact name/title only)`);
  console.log(`  ${enrichedCount + partialCount} total leads updated`);
}

updateSheet().catch(console.error);
