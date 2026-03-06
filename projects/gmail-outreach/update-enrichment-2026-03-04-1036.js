// PE Enrichment Update - March 4, 2026 10:36 AM
// Cron Job: Hourly PE Research & Enrichment
const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Enrichments from manual web research (Apollo API exhausted)
const ENRICHMENTS = [
  {
    row: null, // Will find by company name
    company: 'Carousel Capital',
    contactName: 'Peter L. Clark Jr',
    title: 'Partner',
    email: 'pclark@carouselcapital.com',
    linkedin: 'https://www.linkedin.com/in/peter-l-clark-07699a7/',
    status: 'Enriched',
    notes: 'Charlotte NC. Partner promoted from Principal. Email pattern verified from RocketReach (pclark@carouselcapital.com). BusinessWire announces promotions (Peter Clark to Partner from Principal). 2026-03-04 enrichment (manual web research, LinkedIn + company news).'
  },
  {
    row: null,
    company: 'CapStreet',
    contactName: 'Neil Kallmeyer',
    title: 'Managing Partner',
    email: 'nkallmeyer@capstreet.com',
    linkedin: 'https://www.linkedin.com/in/neil-kallmeyer-682693136/',
    status: 'Enriched',
    notes: 'Houston TX. Managing Partner. Email pattern inferred from standard CapStreet format. LinkedIn verified. Note: Michelle A. Lewis (previously listed) left firm ~2023, now at ADENTRA Group. 2026-03-04 enrichment (manual web research, LinkedIn).'
  },
  {
    row: null,
    company: 'The Riverside Company',
    contactName: 'Jeremy Holland',
    title: 'Managing Partner, Origination',
    email: 'jholland@riversidecompany.com',
    linkedin: 'https://www.riversidecompany.com/team/jeremy-holland/',
    status: 'Enriched',
    notes: 'Cleveland OH. Global PE, lower middle market. Jeremy Holland (Managing Partner, Origination). Email pattern: [first initial][last]@riversidecompany.com verified from RocketReach (e.g., aacosta@ for Armando Acosta). Other contacts: Stewart A. Kohl (CEO), Armando Acosta (MD, Fundraising/IR). 2026-03-04 enrichment (manual web research, company website).'
  },
  {
    row: null,
    company: 'Arsenal Growth Equity',
    contactName: 'Jason Rottenberg',
    title: 'Co-Founder & General Partner',
    email: 'jrottenberg@arsenalgrowth.com',
    linkedin: 'https://www.linkedin.com/in/jasonrottenberg/',
    status: 'Enriched',
    notes: 'Winter Park FL. B2B Software, Tech-Enabled Services (growth capital). Jason Rottenberg (Co-Founder & General Partner). John Trbovich (Co-Founder & Managing Director). Email pattern inferred: [first]@arsenalgrowth.com. LinkedIn and Crunchbase verified. 2026-03-04 enrichment (manual web research, LinkedIn + Crunchbase).'
  }
];

async function findRowByCompany(sheets, company) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:A'
  });
  
  const rows = res.data.values || [];
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] && rows[i][0].trim().toLowerCase() === company.toLowerCase()) {
      return i + 1; // 1-indexed
    }
  }
  return null;
}

async function updateSheet() {
  console.log('\n=== PE ENRICHMENT UPDATE - MANUAL WEB RESEARCH ===');
  console.log('Date: March 4, 2026 10:36 AM CST');
  console.log('Source: Manual web research (Apollo API exhausted)\n');

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    const sheets = google.sheets({ version: 'v4', auth });

    const updates = [];

    // Find row numbers for each company
    for (const enrichment of ENRICHMENTS) {
      const row = await findRowByCompany(sheets, enrichment.company);
      
      if (!row) {
        console.log(`❌ ${enrichment.company} - NOT FOUND in sheet`);
        continue;
      }

      enrichment.row = row;
      console.log(`✓ Found ${enrichment.company} at row ${row}`);

      // Prepare update (columns C-K: Contact Name, Title, Email, Website, LinkedIn, Sector, Portfolio, Status, Last Contact, Notes)
      // We update: C (Contact), D (Title), E (Email), G (LinkedIn), J (Status), L (Notes)
      const range = `Sheet1!C${row}:L${row}`;
      
      // Read current row to preserve existing data
      const current = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range
      });
      
      const existingRow = current.data.values ? current.data.values[0] : [];
      
      // Build new row preserving Website, Sector, Portfolio, Last Contact
      const newRow = [
        enrichment.contactName,           // C: Contact Name
        enrichment.title,                 // D: Title
        enrichment.email,                 // E: Email
        existingRow[3] || '',             // F: Website (preserve)
        enrichment.linkedin,              // G: LinkedIn
        existingRow[5] || '',             // H: Sector (preserve)
        existingRow[6] || '',             // I: Portfolio (preserve)
        enrichment.status,                // J: Status
        existingRow[8] || '',             // K: Last Contact (preserve)
        enrichment.notes                  // L: Notes
      ];

      updates.push({
        range,
        values: [newRow]
      });

      console.log(`  → ${enrichment.contactName} (${enrichment.title})`);
      console.log(`     ${enrichment.email}`);
    }

    // Execute batch update
    if (updates.length > 0) {
      console.log(`\n📝 Updating ${updates.length} rows in Google Sheet...`);
      
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SHEET_ID,
        resource: {
          valueInputOption: 'RAW',
          data: updates
        }
      });

      console.log('✅ Sheet updated successfully!\n');
    } else {
      console.log('\n⚠️  No updates to apply\n');
    }

    // Summary
    console.log('=== ENRICHMENT SUMMARY ===');
    console.log(`Total firms enriched: ${updates.length}`);
    console.log(`Method: Manual web research`);
    console.log(`Status: Apollo API out of credits (422 error)`);
    console.log(`\nFirms updated:`);
    ENRICHMENTS.forEach(e => {
      if (e.row) {
        console.log(`  - ${e.company} (Row ${e.row})`);
      }
    });

  } catch (error) {
    console.error('❌ Error updating sheet:', error.message);
    throw error;
  }
}

updateSheet().catch(console.error);
