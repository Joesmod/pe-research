// PE Research & Enrichment - March 5 00:06 AM
// Update sheet with enrichments

const { google } = require('googleapis');
const fs = require('fs');

const SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SHEET_NAME = 'Sheet1';

async function updateSheet() {
  // Load service account credentials
  const credentials = JSON.parse(
    fs.readFileSync('service-account.json', 'utf8')
  );

  // Authorize
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Read current data
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A:M`,
  });

  const rows = response.data.values || [];
  console.log(`Total rows: ${rows.length}`);

  // Find rows to update
  const updates = [];

  // Enrichment 1: Sunstone Partners
  const sunstoneIdx = rows.findIndex(row => 
    row[0] && row[0].toLowerCase().includes('sunstone')
  );
  if (sunstoneIdx > 0) {
    console.log(`Found Sunstone Partners at row ${sunstoneIdx + 1}`);
    updates.push({
      range: `${SHEET_NAME}!C${sunstoneIdx + 1}:M${sunstoneIdx + 1}`,
      values: [[
        'Kara Donnelly',                                    // Contact Name
        'VP of Business Development',                       // Title
        'kara@sunstonepartners.com',                       // Email
        'https://sunstonepartners.com',                    // Website
        'https://www.linkedin.com/company/sunstone-partners', // LinkedIn
        'AI/tech-enabled services, software',              // Sector Focus
        '$1.7B AUM across 3 funds',                        // Portfolio Companies
        'Enriched',                                         // Status
        '',                                                 // Last Contacted
        'Kara Donnelly (VP BD) found on team page. Email inferred from domain pattern (LPRelations@sunstonepartners.com, pr@sunstonepartners.com confirmed). $1.7B AUM, tech-enabled services/software focus. 2026-03-05 enrichment.', // Notes
        'https://sunstonepartners.com/team/'               // Company Info URL
      ]]
    });
  }

  // Enrichment 2: Tola Capital
  const tolaIdx = rows.findIndex(row => 
    row[0] && row[0].toLowerCase().includes('tola')
  );
  if (tolaIdx > 0) {
    console.log(`Found Tola Capital at row ${tolaIdx + 1}`);
    updates.push({
      range: `${SHEET_NAME}!C${tolaIdx + 1}:M${tolaIdx + 1}`,
      values: [[
        'Sheila Gulati',                                    // Contact Name
        'Founder & Managing Partner',                       // Title
        'sheila@tolacapital.com',                          // Email
        'https://tolacapital.com',                         // Website
        'https://www.linkedin.com/company/tola-capital',   // LinkedIn
        'B2B software, growth equity',                     // Sector Focus
        '$230M fund',                                       // Portfolio Companies
        'Enriched',                                         // Status
        '',                                                 // Last Contacted
        'Sheila Gulati (Founder & Managing Partner) - email verified on ContactOut. Growth VC/PE, $230M fund, B2B software. 2026-03-05 enrichment.', // Notes
        'https://tolacapital.com/our-team'                 // Company Info URL
      ]]
    });
  }

  // Dead leads
  const deadLeads = [
    { name: 'scaleview', reason: 'Investment bank (M&A advisory), not PE firm' },
    { name: 'valiant capital management', reason: 'Hedge fund ($2.7B AUM, public equities), not PE' },
    { name: 'virtas', reason: 'Consulting/advisory firm serving PE firms, not investor' },
    { name: 'sidekick', reason: 'Early-stage VC, not mid-market PE' },
    { name: 'space capital', reason: 'Seed-stage VC (space tech), not PE' },
    { name: 'ribbit', reason: 'Fintech VC, not mid-market PE' }
  ];

  for (const dead of deadLeads) {
    const idx = rows.findIndex(row => 
      row[0] && row[0].toLowerCase().includes(dead.name)
    );
    if (idx > 0) {
      console.log(`Marking ${rows[idx][0]} as Dead at row ${idx + 1}`);
      updates.push({
        range: `${SHEET_NAME}!J${idx + 1}:L${idx + 1}`,
        values: [[
          'Dead Lead',                                      // Status
          '',                                               // Last Contacted
          `${dead.reason}. 2026-03-05 research.`           // Notes
        ]]
      });
    }
  }

  // Batch update
  if (updates.length > 0) {
    console.log(`\nUpdating ${updates.length} rows...`);
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
    console.log('Sheet updated successfully!');
  } else {
    console.log('No rows found to update.');
  }

  // Save timestamp
  fs.writeFileSync('last-enrichment.txt', new Date().toISOString());
}

updateSheet().catch(console.error);
