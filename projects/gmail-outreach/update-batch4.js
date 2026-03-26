const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Batch 4 enrichments (2026-03-17 9:37 AM cron)
const updates = [
  {
    firm: "Frontenac Company",
    contact: "Ronald Kuehl",
    title: "Managing Partner",
    email: "rkuehl@frontenac.com",
    website: "https://frontenac.com",
    linkedin: "https://www.linkedin.com/in/ron-kuehl-74a217a2",
    sectors: "Healthcare, Consumer, Business Services, Industrial",
    notes: "✅ EMAIL VERIFIED from official team page (frontenac.com/team-member/ronald-kuehl). Phone: 312-759-7330. Joined 2006, leads industrial investing. Also: Walter Florence (Managing Partner), Michael Langdon (Managing Partner), Paul Carbery (Senior Partner). Chicago-based. $250M Fund X. CEO1ST sourcing process. Northwestern Kellogg MBA. Pattern: first_initial+last@frontenac.com. Source: Official website (2026-03-17 cron)",
    status: "Enriched"
  },
  {
    firm: "Monroe Capital",
    contact: "Theodore Koenig",
    title: "Chairman & CEO",
    email: "tkoenig@monroecap.com",
    website: "https://monroe-capital.com",
    linkedin: "https://www.linkedin.com/in/theodore-koenig",
    sectors: "Private Credit, Middle Market Lending, Unitranche",
    notes: "Email from ContactOut/RocketReach (tkoenig@monroecap.com). Chairman & CEO. Chicago-based private credit firm. $18B+ AUM. Leading middle market lender. Phone: (847) 226-xxxx (from RocketReach). Frequent industry speaker (Abu Dhabi Finance Week, etc.). Pattern: first_initial+last@monroecap.com or firstname+lastname@monroecap.com. Source: LinkedIn + ContactOut (2026-03-17 cron)",
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

    const readRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:J'
    });

    const rows = readRes.data.values || [];
    console.log(`Total rows in sheet: ${rows.length}`);

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

          const updateValues = [
            [
              row[0] || firmName,           
              update.website,                
              update.contact,                
              update.title,                  
              update.email,                  
              update.website,                
              update.linkedin,               
              update.sectors,                
              update.notes,                  
              update.status                  
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

    console.log('\n✅ Batch 4 update complete');
  } catch (error) {
    console.error('Error updating sheet:', error.message);
    process.exit(1);
  }
}

updateSheet();
