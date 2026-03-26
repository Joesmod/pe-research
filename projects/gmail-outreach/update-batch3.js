const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Batch 3 enrichments (2026-03-17 9:37 AM cron)
const updates = [
  {
    firm: "Rockwood Equity Partners",
    contact: "Brett Keith",
    title: "Managing Partner",
    email: "bkeith@rockwoodequity.com",
    website: "https://www.rockwoodequity.com",
    linkedin: "https://www.linkedin.com/in/brettkeithrockwood",
    sectors: "Business Services, Healthcare Services, Specialty Industrial",
    notes: "Email pattern from RocketReach (b******@rockwoodequity.com = bkeith@, 100% confidence). Co-Managing Partner with Joe Merrill (jmerrill@rockwoodequity.com). New York-based. Other contacts: Kate Faust (Partner Business Development, kfaust@rockwoodequity.com, Cleveland), Vince Nardy (Partner, vnardy@rockwoodequity.com). Lower middle market PE. Pattern: first_initial+last@rockwoodequity.com. Source: rockwoodequity.com + RocketReach (2026-03-17 cron)",
    status: "Enriched - Pattern Verified"
  },
  {
    firm: "Banner Capital Management",
    contact: "Tanner Ainge",
    title: "Founder & Chief Executive Officer",
    email: "tainge@banner.ventures",
    website: "https://bannercap.com",
    linkedin: "https://www.linkedin.com/in/tanner-ainge",
    sectors: "Growth Equity, Middle Market",
    notes: "Email pattern from RocketReach (t******@banner.ventures = tainge@). Founder & CEO. Partnership capital for growth-stage entrepreneurs and family-owned businesses. Chicago-area based. Phone: (224) 212-xxxx. Team: Tyler Price (Managing Director), Bianca Bonus (CFO), Cooper Ainge (Principal), Mark Broadbent (EVP & General Counsel). Pattern: first_initial+last@banner.ventures. Source: bannercap.com + RocketReach (2026-03-17 cron)",
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

    console.log('\n✅ Batch 3 update complete');
  } catch (error) {
    console.error('Error updating sheet:', error.message);
    process.exit(1);
  }
}

updateSheet();
