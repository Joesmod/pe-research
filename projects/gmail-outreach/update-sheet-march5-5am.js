const { google } = require('googleapis');
const key = require('./service-account.json');

const jwtClient = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  ['https://www.googleapis.com/auth/spreadsheets']
);

const sheets = google.sheets({ version: 'v4', auth: jwtClient });
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Enrichment results from research
const enrichments = [
  {
    company: "Keltic Financial Partners",
    row: null, // Will search for it
    updates: {
      status: "Dead - Acquired 2014",
      notes: "Acquired by Ares Management LP in June 2014. Firm no longer exists independently."
    }
  },
  {
    company: "Jett Capital Advisors",
    row: null,
    updates: {
      contactName: "Joe Riggio",
      title: "Founding Partner & CEO",
      linkedin: "https://www.linkedin.com/in/joe-riggio",
      status: "Dead - Investment Bank",
      notes: "Investment banking advisory firm, not PE. Natural resources & tech focus."
    }
  },
  {
    company: "3G Capital",
    row: null,
    updates: {
      contactName: "Alex Behring",
      title: "Co-Founder & Co-Managing Partner",
      linkedin: "https://www.linkedin.com/in/alex-behring-72678424",
      status: "Partial",
      notes: "Co-led with Daniel Schwartz. Extremely private firm - no public email found. Website: 3g-capital.com"
    }
  },
  {
    company: "Apercen Partners LLC",
    row: null,
    updates: {
      status: "Dead - Not PE Firm",
      notes: "Tax consulting firm for HNW individuals, not a PE investor. Focus on venture/hedge/PE partner tax planning."
    }
  },
  {
    company: "Arctaris Impact Investors",
    row: null,
    updates: {
      contactName: "Jonathan Tower",
      title: "Founder & Managing Partner",
      email: "jonathan@arctaris.com",
      linkedin: "https://www.linkedin.com/in/jonathan-tower",
      status: "Enriched",
      notes: "Impact investing, Opportunity Zone funds. $1B+ AUM. Harvard MBA. Source: ContactOut + arctaris.com (2026-03-05)"
    }
  }
];

async function updateSheet() {
  try {
    // First, read all data to find row numbers
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:J'
    });
    
    const rows = res.data.values;
    
    // Find row numbers for each company
    enrichments.forEach(enrich => {
      const rowIndex = rows.findIndex(row => row[0] === enrich.company);
      if (rowIndex !== -1) {
        enrich.row = rowIndex + 1; // +1 for 1-indexing
      }
    });
    
    // Update each row
    for (const enrich of enrichments) {
      if (!enrich.row) {
        console.log(`Could not find row for: ${enrich.company}`);
        continue;
      }
      
      const updates = enrich.updates;
      const batchData = [];
      
      // Column mapping: A=Company, B=Website, C=ContactName, D=Title, E=Email, F=Website2, G=LinkedIn, H=Sectors, I=Notes, J=Status
      if (updates.contactName) {
        batchData.push({
          range: `Sheet1!C${enrich.row}`,
          values: [[updates.contactName]]
        });
      }
      
      if (updates.title) {
        batchData.push({
          range: `Sheet1!D${enrich.row}`,
          values: [[updates.title]]
        });
      }
      
      if (updates.email) {
        batchData.push({
          range: `Sheet1!E${enrich.row}`,
          values: [[updates.email]]
        });
      }
      
      if (updates.linkedin) {
        batchData.push({
          range: `Sheet1!G${enrich.row}`,
          values: [[updates.linkedin]]
        });
      }
      
      if (updates.notes) {
        batchData.push({
          range: `Sheet1!I${enrich.row}`,
          values: [[updates.notes]]
        });
      }
      
      if (updates.status) {
        batchData.push({
          range: `Sheet1!J${enrich.row}`,
          values: [[updates.status]]
        });
      }
      
      if (batchData.length > 0) {
        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: SHEET_ID,
          resource: {
            valueInputOption: 'RAW',
            data: batchData
          }
        });
        
        console.log(`✓ Updated ${enrich.company} (Row ${enrich.row})`);
      }
    }
    
    console.log(`\n=== ENRICHMENT SUMMARY ===`);
    console.log(`Total firms researched: ${enrichments.length}`);
    console.log(`Enriched with emails: 1`);
    console.log(`Dead leads identified: 3`);
    console.log(`Partial updates: 1`);
    
  } catch (error) {
    console.error('Error updating sheet:', error);
  }
}

updateSheet();
