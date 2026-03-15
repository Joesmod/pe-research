const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const credentials = JSON.parse(fs.readFileSync('service-account.json', 'utf8'));
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

// Manually curated enrichments from web research
const enrichments = [
  {
    row: 72,
    firm: 'Flyover Capital',
    contactName: 'Tristan Mace',
    title: 'Managing Partner',
    email: 'tmace@flyovercapital.com',
    linkedin: 'https://www.linkedin.com/in/tristanmace/',
    notes: 'Email verified from official team page https://www.flyovercapital.com/team/tristan-mace/ (2026-03-14 cron)',
    status: 'Enriched'
  },
  {
    row: 15,
    firm: 'JLL Partners',
    contactName: 'Cara Killackey',
    title: 'Managing Director - Capital Formation',
    email: 'c.killackey@jllpartners.com',
    linkedin: '',
    notes: 'Verified from official team page https://www.jllpartners.com/team/ - Capital Formation contact (2026-03-14 cron)',
    status: 'Enriched'
  },
  {
    row: 14,
    firm: 'ShoreView Industries',
    contactName: 'Garrett Davis',
    title: 'Vice President, Business Development',
    email: 'garrett@shoreview.com',
    linkedin: '',
    notes: 'Email verified from official team page https://www.shoreview.com/team/garrett-davis/ - VP Business Development (2026-03-14 cron)',
    status: 'Enriched'
  },
  {
    row: 19,
    firm: 'Palladium Equity Partners',
    contactName: 'Erick Bronner',
    title: 'MD of Fundraising & IR',
    email: 'ebronner@palladiumequity.com',
    linkedin: '',
    notes: 'Title verified from press release (appointed 2021). Email pattern standard. Note: Bloomberg shows "Former" status - may have left firm. (2026-03-14 cron)',
    status: 'Enriched - Needs Email Verification'
  }
];

async function updateSheet() {
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  
  console.log('Updating sheet with manually researched enrichments...\n');
  
  for (const enrich of enrichments) {
    console.log(`Row ${enrich.row}: ${enrich.firm}`);
    console.log(`  ${enrich.contactName} (${enrich.title})`);
    console.log(`  ${enrich.email}`);
    
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
  
  console.log(`✅ Successfully enriched ${enrichments.length} leads`);
}

updateSheet().catch(console.error);
