// Enrichment batch - March 5, 2026 4:06 PM
const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

// Enrichments found
const enrichments = [
  {
    row: 728,
    company: 'Sageview Capital',
    contact: 'Ned Gilhuly',
    title: 'Co-Founder & Partner',
    email: 'ned@sageviewcapital.com',
    linkedin: 'https://www.linkedin.com/in/ned-gilhuly/',
    status: 'Enriched',
    notes: 'Source: ContactOut (third-party data, 2022-07-28)'
  },
  {
    row: 734,
    company: 'Wynnchurch Capital',
    contact: 'Greg Gleason',
    title: 'Managing Partner',
    email: 'ggleason@wynnchurch.com',
    linkedin: 'https://www.linkedin.com/in/greg-gleason-5468848/',
    status: 'Enriched',
    notes: 'Source: RocketReach/ZoomInfo (verified pattern)'
  },
  {
    row: 718,
    company: 'Caffeinated Capital',
    contact: 'Raymond Tonsing',
    title: 'Founder and Managing Partner',
    email: 'raymond@caffeinated.com',
    linkedin: 'https://www.linkedin.com/in/tonsing/',
    status: 'Enriched',
    notes: 'Source: ContactOut (verified 2025-05-01)'
  },
  {
    row: 721,
    company: 'CapitalG',
    contact: 'Laela Sturdy',
    title: 'Managing Partner',
    email: 'lsturdy@capitalg.com',
    linkedin: 'https://www.linkedin.com/in/laela-sturdy-376543/',
    status: 'Enriched',
    notes: 'Source: ContactOut (verified pattern)'
  },
  {
    row: 726,
    company: 'Centerbridge Partners, L.P.',
    contact: 'Amy Schneidkraut',
    title: 'Senior Managing Director, Head of Investor Relations',
    email: 'aschneidkraut@centerbridge.com',
    linkedin: 'https://www.linkedin.com/in/amy-schneidkraut-/',
    status: 'Enriched',
    notes: 'Source: RocketReach (official Centerbridge team page confirmed)'
  },
  {
    row: 722,
    company: 'CapitalSpring',
    contact: 'Erik Herrmann',
    title: 'Partner, Head of Investment Group',
    email: 'eherrmann@capitalspring.com',
    linkedin: 'https://www.linkedin.com/in/erik-herrmann-205aa624/',
    status: 'Enriched',
    notes: 'Source: RocketReach (official CapitalSpring team page confirmed)'
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
  
  console.log(`\n=== UPDATING ${enrichments.length} ROWS ===\n`);
  
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
  
  console.log(`✅ Successfully enriched ${enrichments.length} firms!`);
}

main().catch(console.error);
