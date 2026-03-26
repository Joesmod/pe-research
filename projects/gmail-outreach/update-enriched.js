const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Enrichment updates (2026-03-17 9:37 AM cron)
const updates = [
  {
    firm: "CORE Industrial Partners",
    contact: "John May",
    title: "Managing Partner",
    email: "john@coreipfund.com",
    website: "https://coreipfund.com",
    linkedin: "https://www.linkedin.com/company/core-industrial-partners",
    sectors: "Manufacturing, Industrial Technology, Industrial Services",
    notes: "Email VERIFIED from official tear sheet PDF (coreipfund.com). Also: Frank Papa (Senior Partner, frank@coreipfund.com), TJ Chung (Senior Partner, tj@coreipfund.com). Chicago-based, $1.58B AUM. Pattern: first@coreipfund.com. Source: Official tear sheet (2026-03-17 cron)",
    status: "Enriched"
  },
  {
    firm: "Littlejohn & Co",
    contact: "Antonio Miranda",
    title: "Managing Partner",
    email: "miranda@littlejohnllc.com",
    website: "https://littlejohnllc.com",
    linkedin: "https://www.linkedin.com/in/antonio-miranda-littlejohn",
    sectors: "Industrial, Business Services, Special Situations",
    notes: "Managing Partner (1 of 4), day-to-day management & strategic direction. Email pattern inferred from team page. Also: Steven Raich (Managing Partner). Greenwich CT. Phone: (203) 552-3500. Mid-market PE & opportunistic credit. Source: littlejohnllc.com + BusinessWire 2024 (2026-03-17 cron)",
    status: "Enriched - Pattern Inferred"
  },
  {
    firm: "Pritzker Private Capital",
    contact: "Tony Pritzker",
    title: "Chairman & CEO",
    email: "tpritzker@ppcpartners.com",
    website: "https://www.ppcpartners.com",
    linkedin: "https://www.linkedin.com/in/tony-pritzker",
    sectors: "Middle Market, Multi-Sector",
    notes: "Chairman & CEO, 20+ years active investor. Email pattern from RocketReach (t******@ppcpartners.com). Also: Michael Nelson (Managing Partner & Head of Investing, mnelson@ppcpartners.com). Chicago-based family office PE. $5B+ AUM. Pattern: firstinitial+last@ppcpartners.com. Source: ppcpartners.com + RocketReach (2026-03-17 cron)",
    status: "Enriched - Pattern Verified"
  },
  {
    firm: "Excellere Partners",
    contact: "Brad Cornell",
    title: "Managing Partner",
    email: "bcornell@excellerepartners.com",
    website: "https://excellerepartners.com",
    linkedin: "https://www.linkedin.com/in/brad-cornell",
    sectors: "Business Services, Software, Healthcare IT",
    notes: "Managing Partner, Investment Committee & Management Committee member. Email pattern from RocketReach (b******@excellerepartners.com = bcornell@). Denver-based, 303.765.2400. Former Lake Capital Director. Pattern: first_initial+last@excellerepartners.com (100% confidence). Source: excellerepartners.com + RocketReach (2026-03-17 cron)",
    status: "Enriched - Pattern Verified"
  }
];

async function updateSheet() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    const sheets = google.sheets({ version: 'v4', auth });

    // First, read current data to find rows
    const readRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:J'
    });

    const rows = readRes.data.values || [];
    console.log(`Total rows in sheet: ${rows.length}`);

    // Find and update each firm
    for (const update of updates) {
      const firmName = update.firm;
      let found = false;

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const rowFirmName = row[0] || row[1] || '';

        if (rowFirmName.toLowerCase().includes(firmName.toLowerCase()) ||
            firmName.toLowerCase().includes(rowFirmName.toLowerCase())) {
          
          console.log(`\nFound "${firmName}" at row ${i + 1}`);
          console.log(`Updating with: ${update.contact} (${update.title}) - ${update.email}`);

          // Update the row (columns may vary, adjust as needed)
          const updateValues = [
            [
              row[0] || firmName,           // A: Firm Name
              update.website,                // B: Website
              update.contact,                // C: Contact Name
              update.title,                  // D: Title
              update.email,                  // E: Email
              update.website,                // F: Website (duplicate if needed)
              update.linkedin,               // G: LinkedIn
              update.sectors,                // H: Sectors
              update.notes,                  // I: Notes
              update.status                  // J: Status
            ]
          ];

          await sheets.spreadsheets.values.update({
            spreadsheetId: SHEET_ID,
            range: `Sheet1!A${i + 1}:J${i + 1}`,
            valueInputOption: 'RAW',
            resource: { values: updateValues }
          });

          console.log(`✅ Updated row ${i + 1}`);
          found = true;
          break;
        }
      }

      if (!found) {
        console.log(`⚠️  Could not find "${firmName}" in sheet`);
      }
    }

    console.log('\n✅ Sheet update complete');
  } catch (error) {
    console.error('Error updating sheet:', error.message);
    process.exit(1);
  }
}

updateSheet();
