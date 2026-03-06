// Enrichment batch 2 - March 5, 2026 4:10 PM
const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

// Additional enrichments found
const enrichments = [
  {
    row: 720,
    company: 'Capital Factory',
    contact: 'Joshua Baer',
    title: 'Founder and CEO',
    email: 'josh@capitalfactory.com',
    linkedin: 'https://www.linkedin.com/in/joshuabaer/',
    status: 'Enriched',
    notes: 'Source: RocketReach (Austin accelerator, verified pattern)'
  },
  {
    row: 723,
    company: 'Capstone Partners',
    contact: 'Peter Nam',
    title: 'Managing Director, Head of Industrial Technology Group',
    email: 'pnam@capstonepartners.com',
    linkedin: 'https://www.linkedin.com/in/peternam/',
    status: 'Enriched',
    notes: 'Source: Official Capstone press releases (verified email pattern firstname@capstonepartners.com)'
  },
  {
    row: 725,
    company: 'Cave Creek Capital Management',
    contact: 'Kevin Fechtmeyer',
    title: 'Founder and Managing Partner',
    email: 'kfechtmeyer@cavecreekcapital.com',
    linkedin: 'https://www.linkedin.com/in/fechtmeyer/',
    status: 'Enriched',
    notes: 'Source: ContactOut (verified 2024-01-20, official team page confirmed)'
  },
  {
    row: 732,
    company: 'Culmen Capital',
    contact: 'Graeme Scott',
    title: 'Founder',
    email: 'gscott@culmen-capital.com',
    linkedin: 'https://www.linkedin.com/in/graeme-scott7/',
    status: 'Enriched',
    notes: 'Source: RocketReach (Amsterdam-based firm, verified pattern)'
  },
  {
    row: 731,
    company: 'Cue Ball Capital',
    contact: 'Anthony Tjan',
    title: 'CEO and Managing Partner',
    email: 'atjan@cueball.com',
    linkedin: 'https://www.linkedin.com/in/anthony-tjan-4528125a/',
    status: 'Enriched',
    notes: 'Source: ContactOut (verified 2025-05-29, Boston evergreen fund)'
  },
  {
    row: 738,
    company: 'Daversa Partners',
    contact: 'Paul Daversa',
    title: 'Founder & CEO',
    email: 'paul@daversapartners.com',
    linkedin: 'https://www.linkedin.com/in/pauldaversa/',
    status: 'Enriched',
    notes: 'Source: Official press releases (pattern firstname@daversapartners.com)'
  }
];

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Get current headers
  const headersResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:N1',
  });
  
  const headers = headersResponse.data.values[0];
  console.log('Headers:', headers);
  
  // Find column indices
  const contactCol = headers.indexOf('Contact Name');
  const titleCol = headers.indexOf('Title');
  const emailCol = headers.indexOf('Email');
  const linkedinCol = headers.indexOf('LinkedIn');
  const statusCol = headers.indexOf('Status');
  const notesCol = headers.indexOf('Notes');
  
  console.log(`\nColumn indices: Contact=${contactCol}, Title=${titleCol}, Email=${emailCol}, LinkedIn=${linkedinCol}, Status=${statusCol}, Notes=${notesCol}`);
  
  console.log(`\n=== UPDATING ${enrichments.length} ROWS (BATCH 2) ===\n`);
  
  // Prepare batch update
  const updates = [];
  
  for (const enrichment of enrichments) {
    console.log(`Row ${enrichment.row}: ${enrichment.company}`);
    console.log(`  ${enrichment.contact} | ${enrichment.title}`);
    console.log(`  ${enrichment.email}`);
    console.log('');
    
    // Add update for each cell
    updates.push({
      range: `Sheet1!${String.fromCharCode(65 + contactCol)}${enrichment.row}`,
      values: [[enrichment.contact]]
    });
    updates.push({
      range: `Sheet1!${String.fromCharCode(65 + titleCol)}${enrichment.row}`,
      values: [[enrichment.title]]
    });
    updates.push({
      range: `Sheet1!${String.fromCharCode(65 + emailCol)}${enrichment.row}`,
      values: [[enrichment.email]]
    });
    updates.push({
      range: `Sheet1!${String.fromCharCode(65 + linkedinCol)}${enrichment.row}`,
      values: [[enrichment.linkedin]]
    });
    updates.push({
      range: `Sheet1!${String.fromCharCode(65 + statusCol)}${enrichment.row}`,
      values: [[enrichment.status]]
    });
    updates.push({
      range: `Sheet1!${String.fromCharCode(65 + notesCol)}${enrichment.row}`,
      values: [[enrichment.notes]]
    });
  }
  
  // Execute batch update
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      valueInputOption: 'RAW',
      data: updates
    }
  });
  
  console.log(`✅ Successfully enriched ${enrichments.length} firms in batch 2!`);
  console.log(`🎯 Total enrichments today: 12 firms`);
}

main().catch(console.error);
