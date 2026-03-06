const { google } = require('googleapis');
const key = require('./service-account.json');

const auth = new google.auth.GoogleAuth({
  credentials: key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// ONLY firms with VERIFIED, PUBLISHED emails on official sources
const enrichments = [
  {
    row: 787,
    company: 'Roark Capital',
    contact: 'Neal Aronson',
    title: 'Founder and Managing Partner',
    email: 'naronson@roarkcapital.com',
    linkedin: 'https://www.linkedin.com/in/neal-aronson/',
    notes: 'Source: Official Roark Capital team page - published email verified'
  },
  {
    row: 787, // Adding alternate row for Roark with different contact
    company: 'Roark Capital',
    contact: 'Roanne Daniels',
    title: 'Managing Director',
    email: 'rdaniels@roarkcapital.com',
    linkedin: 'https://www.linkedin.com/in/roannedaniels/',
    notes: 'Source: Official Roark Capital team page - published email verified'
  },
  // Names found but NO published emails - leaving blank per instructions
  {
    row: 671,
    company: 'Seacoast Capital',
    contact: 'Jamie Donelan',
    title: 'Partner',
    email: '',  // No published email found
    linkedin: 'https://www.linkedin.com/in/jamiedonelan/',
    notes: 'Contact identified via Seacoast team page. Email not publicly available - recommend LinkedIn outreach'
  },
  {
    row: 790,
    company: 'Sageview Capital',
    contact: 'Ned Gilhuly',
    title: 'Co-Founder & Partner',
    email: '',  // No published email found
    linkedin: '',
    notes: 'Contact identified via Sageview team page. Email not publicly available'
  },
  {
    row: 891,
    company: 'Odyssey Investment Partners',
    contact: 'Brian Kwait',
    title: 'CEO',
    email: '',  // No published email found
    linkedin: '',
    notes: 'Contact identified via public sources. Email not publicly available'
  },
  {
    row: 935,
    company: 'Carousel Capital',
    contact: 'Peter L Clark',
    title: 'Partner',
    email: '',  // Only generic info@ found
    linkedin: '',
    notes: 'Contact identified via public sources. Direct email not publicly available. General: info@carouselcapital.com'
  },
];

async function updateSheet() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:K'
  });
  
  const rows = res.data.values || [];
  console.log(`Total rows: ${rows.length}`);
  
  const updates = [];
  let enrichedCount = 0;
  let partialCount = 0;
  
  for (const enrich of enrichments) {
    const rowIdx = enrich.row - 1;
    if (rowIdx >= rows.length) {
      console.log(`Row ${enrich.row} out of bounds`);
      continue;
    }
    
    const currentRow = rows[rowIdx] || [];
    console.log(`\n[${enrich.row}] ${enrich.company}`);
    console.log(`  Contact: ${enrich.contact}`);
    console.log(`  Email: ${enrich.email || '(none - not published)'}`);
    
    const newRow = [...currentRow];
    while (newRow.length < 11) newRow.push('');
    
    newRow[2] = enrich.contact;
    newRow[3] = enrich.title;
    
    if (enrich.email) {
      newRow[4] = enrich.email;
      newRow[9] = 'Enriched';
      enrichedCount++;
    } else {
      // Don't overwrite existing email if present
      if (!newRow[4] || newRow[4].startsWith('info@') || newRow[4].startsWith('sales@')) {
        newRow[4] = '';  // Clear generic email
      }
      newRow[9] = 'Partial - No Email';
      partialCount++;
    }
    
    if (enrich.linkedin) newRow[6] = enrich.linkedin;
    newRow[10] = enrich.notes;
    
    updates.push({
      range: `Sheet1!A${enrich.row}:K${enrich.row}`,
      values: [newRow]
    });
  }
  
  if (updates.length > 0) {
    console.log(`\n\nApplying ${updates.length} updates...`);
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      resource: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
    console.log('✅ Sheet updated');
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`  ${enrichedCount} fully enriched (with verified email)`);
  console.log(`  ${partialCount} partially enriched (name/title only)`);
}

updateSheet().catch(console.error);
