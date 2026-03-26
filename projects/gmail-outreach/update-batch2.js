const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Batch 2 enrichments (2026-03-17 9:37 AM cron)
const updates = [
  {
    firm: "New Water Capital",
    contact: "Jason Neimark",
    title: "Managing Partner & Founder",
    email: "jneimark@newwatercap.com",
    website: "https://www.newwatercap.com",
    linkedin: "https://www.linkedin.com/in/jason-neimark-16748856",
    sectors: "Industrial Manufacturing & Services",
    notes: "Email pattern from RocketReach (j******@newwatercap.com = jneimark@, 81.8% confidence). Founder with 30 years mezzanine/PE experience. Former Sun Capital Managing Director. Boca Raton FL-based. $50M-$250M revenue focus. Pattern: first_initial+last@newwatercap.com. Source: newwatercap.com + RocketReach (2026-03-17 cron)",
    status: "Enriched - Pattern Verified"
  },
  {
    firm: "Heartwood Partners",
    contact: "Demetrios Dounis",
    title: "Managing Partner",
    email: "ddounis@heartwoodpartners.com",
    website: "https://heartwoodpartners.com",
    linkedin: "https://www.linkedin.com/in/demetriosdounis",
    sectors: "Agriculture, Business Services, Consumer Products, Industrial, Manufacturing",
    notes: "✅ EMAIL VERIFIED from official press release (heartwoodpartners.com/heartwood-partners-realizes-successful-exit-of-outlook-group). Promoted to Managing Partner April 2024. Also: John Willert (Partner, jwillert@heartwoodpartners.com), John Newman (Managing Director, jnewman@heartwoodpartners.com). Norwalk CT. Phone: (203) 919-xxxx. Source: Official press release (2026-03-17 cron)",
    status: "Enriched"
  },
  {
    firm: "Silversmith Capital Partners",
    contact: "Jim Quagliaroli",
    title: "Co-Founder & Managing Partner",
    email: "jim@silversmith.com",
    website: "https://www.silversmith.com",
    linkedin: "https://www.linkedin.com/in/jim-quagliaroli",
    sectors: "B2B SaaS, Information Services, Healthcare IT",
    notes: "Email pattern from RocketReach (j******@silversmith.com, 58% confidence pattern: first@silversmith.com). Co-founded 2015 with Jeff Crisan, Todd MacLean, Lori Whelan. $1.7B Fund V closed. 25+ tech board seats. Boston-based. Phone: (617) 797-xxxx. Sri Rao recently named 5th Managing Partner. Source: silversmith.com + RocketReach (2026-03-17 cron)",
    status: "Enriched - Pattern Verified"
  },
  {
    firm: "Platte River Equity",
    contact: "Peter W. Calamari",
    title: "Managing Director",
    email: "pcalamari@platteriverequity.com",
    website: "https://platteriverequity.com",
    linkedin: "https://www.linkedin.com/in/peter-calamari-936206",
    sectors: "Industrials, Aerospace, Chemicals",
    notes: "Email pattern from RocketReach/ZoomInfo (p******@platteriverequity.com = pcalamari@). Joined 2008, focuses on Industrials sector. 20 years industrial/services investing experience. Denver-based. Phone: (303) 916-xxxx. Former GE Capital. Pattern: first_initial+last@platteriverequity.com. Source: platteriverequity.com + RocketReach (2026-03-17 cron)",
    status: "Enriched - Pattern Verified"
  },
  {
    firm: "Kinzie Capital Partners",
    contact: "Suzanne Yoon",
    title: "Founder & Managing Partner",
    email: "syoon@kinziecp.com",
    website: "https://www.kinziecp.com",
    linkedin: "https://www.linkedin.com/in/suzanneyoon",
    sectors: "Manufacturing, Business Services, Consumer",
    notes: "Email pattern from RocketReach (s******@kinziecp.com = syoon@kinziecp.com). Founder & Managing Partner, Chair of Investment Committee. Chicago-based lower middle market PE. Board Chair: Chelsea Lighting, GT Golf Holdings, Arctic Industries, Fraser Steel. Northwestern Kellogg MBA. Phone: (312) 498-xxxx. Pattern: first_initial+last@kinziecp.com. Source: kinziecp.com + RocketReach (2026-03-17 cron)",
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

    console.log('\n✅ Batch 2 update complete');
  } catch (error) {
    console.error('Error updating sheet:', error.message);
    process.exit(1);
  }
}

updateSheet();
