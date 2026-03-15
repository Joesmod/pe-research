const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Additional enrichments from this cron run
const newEnrichments = [
  {
    firmName: "Apax Partners",
    contactName: "Mitch Truwit",
    title: "Co-CEO",
    email: "Mitch.Truwit@apax.com",
    linkedin: "https://www.linkedin.com/in/mitchtruwit/",
    status: "Enriched",
    notes: "Co-CEO with Andrew Sillitoe. Joined 2006. Deep tech & consumer exp. Pattern: First.Last@apax.com. Source: apax.com + LeadIQ"
  },
  {
    firmName: "Nautic Partners",
    contactName: "Chris Crosby",
    title: "Managing Director",
    email: "ccrosby@nautic.com",
    linkedin: "https://www.linkedin.com/in/chris-crosby-8a7bb467/",
    status: "Enriched",
    notes: "Harvard MBA. Providence RI-based middle-market PE. Source: RocketReach + LinkedIn"
  },
  {
    firmName: "RLH Equity Partners",
    contactName: "Rob Rodin",
    title: "Vice Chairman, General Partner & Managing Director",
    email: "rrodin@rlhequity.com",
    linkedin: "https://www.linkedin.com/in/robrodin/",
    status: "Enriched",
    notes: "Vice Chair & MD. Tech-infused professional services focus. LA-based. Source: rlhequity.com press + pattern"
  }
];

async function updateSheet() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Read current sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:J',
    });
    
    const rows = response.data.values;
    const updates = [];
    
    for (const enrichment of newEnrichments) {
      for (let i = 1; i < rows.length; i++) {
        const firmName = rows[i][0] || '';
        if (firmName === enrichment.firmName) {
          const rowNum = i + 1;
          updates.push({
            range: `Sheet1!C${rowNum}:H${rowNum}`,
            values: [[
              enrichment.contactName,
              enrichment.title,
              enrichment.email,
              enrichment.linkedin,
              enrichment.status,
              enrichment.notes
            ]]
          });
          console.log(`Queued update for row ${rowNum}: ${enrichment.firmName}`);
          break;
        }
      }
    }
    
    if (updates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SHEET_ID,
        resource: {
          valueInputOption: 'USER_ENTERED',
          data: updates
        }
      });
      console.log(`\n✅ Successfully updated ${updates.length} additional firms`);
    } else {
      console.log('No matching firms found to update');
    }
  } catch (error) {
    console.error('Error updating sheet:', error.message);
    throw error;
  }
}

updateSheet();
