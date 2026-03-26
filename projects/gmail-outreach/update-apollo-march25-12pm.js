const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');

// Apollo-verified contacts from today's enrichment
const enrichments = [
  {
    company: 'Audax Private Equity',
    contact: 'Matthew Gosselin',
    title: 'Managing Director',
    email: 'mgosselin@audaxprivateequity.com',
    linkedin: 'http://www.linkedin.com/in/matthew-gosselin-84711a40',
    status: 'Enriched',
    notes: 'Apollo API verified - 2026-03-25. Email: mgosselin@audaxprivateequity.com (verified).'
  },
  {
    company: 'Flexpoint Ford',
    contact: 'Don Edwards',
    title: 'Chief Executive Officer',
    email: 'dedwards@flexpointford.com',
    linkedin: 'http://www.linkedin.com/in/don-edwards-0b119548',
    status: 'Enriched',
    notes: 'Apollo API verified - 2026-03-25. CEO contact with verified email.'
  },
  {
    company: 'Blue Star Innovation Partners',
    contact: 'John Marquis',
    title: 'Managing Director',
    email: 'jmarquis@bluestarinnovationpartners.com',
    linkedin: 'http://www.linkedin.com/in/john-marquis-5a731016',
    status: 'Enriched',
    notes: 'Apollo API verified - 2026-03-25. Managing Director contact.'
  },
  {
    company: 'Rockbridge Growth Equity, LLC',
    contact: 'Steve Linden',
    title: 'Partner',
    email: 'stevelinden@rbequity.com',
    linkedin: 'http://www.linkedin.com/in/steve-linden-652412',
    status: 'Enriched',
    notes: 'Apollo API verified - 2026-03-25. Partner-level contact.'
  },
  {
    company: 'Petra Capital Partners',
    contact: 'Michael Blackburn',
    title: 'Managing Partner',
    email: 'mwb@petracapital.com',
    linkedin: 'http://www.linkedin.com/in/michael-blackburn-b080737',
    status: 'Enriched',
    notes: 'Apollo API verified - 2026-03-25. Managing Partner contact.'
  }
];

async function main() {
  console.log('Apollo Enrichment Update - March 25, 2026, 12:46 PM\n');
  
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read all rows
  console.log('Reading sheet...');
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A2:P',
  });
  
  const rows = response.data.values || [];
  console.log(`Total rows: ${rows.length}\n`);
  
  let updateCount = 0;
  const updates = [];
  
  for (const enrichment of enrichments) {
    // Find the row for this company
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] || [];
      const company = (row[0] || '').trim();
      
      if (company === enrichment.company) {
        const rowNum = i + 2; // +2 because we start from row 2
        console.log(`✅ Found: ${company} at row ${rowNum}`);
        console.log(`   Updating with: ${enrichment.contact} - ${enrichment.email}`);
        
        // Update: Col C (Contact Name), Col D (Title), Col E (Email), Col G (LinkedIn), Col H (Status/Enrichment), Col I (Notes)
        updates.push({
          range: `Sheet1!C${rowNum}:I${rowNum}`,
          values: [[
            enrichment.contact,
            enrichment.title,
            enrichment.email,
            '', // Col F - Additional field
            enrichment.linkedin,
            enrichment.status,
            enrichment.notes
          ]]
        });
        
        updateCount++;
        break;
      }
    }
  }
  
  if (updates.length > 0) {
    console.log(`\nUpdating ${updates.length} rows...`);
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
    console.log('✅ Sheet updated successfully!');
  } else {
    console.log('No rows found to update');
  }
  
  console.log(`\nSummary: ${updateCount} contacts enriched via Apollo API`);
}

main().catch(console.error);
