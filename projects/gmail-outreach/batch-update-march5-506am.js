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

// All enrichment results from 5:06 AM cron run
const enrichments = [
  {
    company: "Argentum Capital Partners",
    updates: {
      contactName: "Daniel Raynor",
      title: "Co-Founder & Managing Partner",
      email: "draynor@argentumgroup.com",
      linkedin: "https://www.linkedin.com/in/daniel-raynor-21224310",
      status: "Enriched",
      notes: "Co-founded with Walter Barandiaran. Growth equity, small buyouts. Wharton. Source: argentumgroup.com press releases (2026-03-05)"
    }
  },
  {
    company: "ArrowMark Partners",
    updates: {
      status: "Dead - Asset Manager",
      notes: "$900M AUM. Asset management firm - CLO funds, leveraged loans, equity strategies, CRE finance. Not a PE investor. Multiple portfolio managers, no single decision-maker."
    }
  },
  {
    company: "Atlantic Street Capital Advisors, Inc.",
    updates: {
      contactName: "Peter Shabecoff",
      title: "Founder & Managing Partner",
      linkedin: "https://www.linkedin.com/in/peter-shabecoff",
      status: "Partial",
      notes: "Founded 2006. Lower middle market PE. No public email found. Source: atlanticstreetcapital.com, Mergr (2026-03-05)"
    }
  },
  {
    company: "RCP Advisors",
    updates: {
      contactName: "Jon Madorsky",
      title: "Managing Partner",
      linkedin: "https://www.linkedin.com/in/jon-madorsky",
      status: "Dead - Fund of Funds",
      notes: "$18.7B committed capital. Invests in other PE funds (secondaries, small buyouts), not direct operating companies. 570+ partnership investments."
    }
  },
  {
    company: "Victory Capital",
    updates: {
      status: "Dead - Asset Manager",
      notes: "Publicly traded (VCTR) investment management firm. Manages mutual funds, ETFs, SMAs. Not a PE firm."
    }
  }
];

async function updateSheet() {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:J'
    });
    
    const rows = res.data.values;
    let updateCount = 0;
    
    for (const enrich of enrichments) {
      const rowIndex = rows.findIndex(row => row[0] === enrich.company);
      if (rowIndex === -1) {
        console.log(`Could not find row for: ${enrich.company}`);
        continue;
      }
      
      const rowNum = rowIndex + 1;
      const updates = enrich.updates;
      const batchData = [];
      
      if (updates.contactName) {
        batchData.push({ range: `Sheet1!C${rowNum}`, values: [[updates.contactName]] });
      }
      if (updates.title) {
        batchData.push({ range: `Sheet1!D${rowNum}`, values: [[updates.title]] });
      }
      if (updates.email) {
        batchData.push({ range: `Sheet1!E${rowNum}`, values: [[updates.email]] });
      }
      if (updates.linkedin) {
        batchData.push({ range: `Sheet1!G${rowNum}`, values: [[updates.linkedin]] });
      }
      if (updates.notes) {
        batchData.push({ range: `Sheet1!I${rowNum}`, values: [[updates.notes]] });
      }
      if (updates.status) {
        batchData.push({ range: `Sheet1!J${rowNum}`, values: [[updates.status]] });
      }
      
      if (batchData.length > 0) {
        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: SHEET_ID,
          resource: {
            valueInputOption: 'RAW',
            data: batchData
          }
        });
        console.log(`✓ Updated ${enrich.company} (Row ${rowNum})`);
        updateCount++;
      }
    }
    
    console.log(`\n=== BATCH UPDATE SUMMARY (5:06 AM) ===`);
    console.log(`Firms updated: ${updateCount}`);
    console.log(`Fully enriched (with email): 1`);
    console.log(`Partial enrichments: 1`);
    console.log(`Dead leads identified: 3`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

updateSheet();
