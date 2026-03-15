const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = require('./service-account.json');

const auth = new google.auth.GoogleAuth({
  credentials: SERVICE_ACCOUNT,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// March 8, 2026 Enrichments
const enrichments = [
  {
    firm: 'HRCap',
    contact: 'Andrew Sungsoo Kim',
    title: 'President & CEO',
    email: 'andrew@hrcap.com',
    linkedin: 'https://www.linkedin.com/in/andrew-sungsoo-kim-377899a/',
    status: 'Enriched',
    notes: 'Source: ContactOut (verified). Founded HRCap 2000, 35+ years HR/org leadership expertise. Ridgefield Park, NJ.'
  },
  {
    firm: 'Jett Capital',
    contact: 'Sam Grauer',
    title: 'Founding Partner, Head of Capital Markets',
    email: 'sgrauer@jettcapital.com',
    linkedin: 'https://www.linkedin.com/in/sam-grauer-4519606/',
    status: 'Enriched',
    notes: 'Source: RocketReach pattern. Global leader in special situations and project finance advisory. NYC-based.'
  },
  {
    firm: 'ScaleView Partners',
    contact: 'Gabe Wilcox',
    title: 'Co-Founder & Partner',
    email: 'gabe@scaleviewpartners.com',
    linkedin: 'https://www.linkedin.com/in/gabe-wilcox/',
    status: 'Enriched - Investment Bank',
    notes: 'Source: RocketReach pattern. Investment bank for tech M&A. Former founder (MineralSoft exit 2018), M&A banker, PE investor. Austin, TX.'
  },
  {
    firm: 'Apex Service Partners',
    contact: 'Scott Gaines',
    title: 'COO, Southeast Region',
    email: 'sgaines@apexservicepartners.com',
    linkedin: 'https://www.linkedin.com/in/scott-gaines/',
    status: 'Enriched - Platform Co',
    notes: 'Source: RocketReach pattern. HVAC/plumbing/electrical platform backed by Alpine Investors. 8000+ employees. Tampa, FL.'
  },
  {
    firm: 'Bespoke Partners',
    contact: 'Eric Walczykowski',
    title: 'CEO',
    email: 'eric.w@bespokepartners.com',
    linkedin: 'https://www.linkedin.com/in/eric-walczykowski/',
    status: 'Enriched - Search Firm',
    notes: 'Source: ContactOut (verified). Executive search firm for software/SaaS. Growth exec, $4.5B+ exits. San Diego, CA.'
  },
  {
    firm: 'Kinect Capital',
    status: 'Dead - Not PE',
    notes: '501(c)(3) non-profit educational organization. Not a PE firm.'
  },
  {
    firm: 'Aeris Partners',
    status: 'Dead - Not PE',
    notes: 'Investment bank / M&A advisory. Not a PE investor.'
  },
  {
    firm: 'Odyssey Search Partners',
    status: 'Dead - Not PE',
    notes: 'Executive search firm placing investment professionals. Not a PE firm.'
  }
];

async function updateSheet() {
  try {
    // Read the sheet to find row numbers
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:K',
    });

    const rows = result.data.values;
    const headers = rows[0];
    
    // Find column indices
    const companyCol = headers.indexOf('Company Name');
    const contactCol = headers.indexOf('Contact Name');
    const titleCol = headers.indexOf('Title');
    const emailCol = headers.indexOf('Email');
    const linkedinCol = headers.indexOf('LinkedIn');
    const statusCol = headers.indexOf('Status');
    const portfolioCol = headers.indexOf('Portfolio Companies'); // Using this for notes

    console.log('Column indices:', { companyCol, contactCol, titleCol, emailCol, linkedinCol, statusCol, portfolioCol });

    let updateCount = 0;
    
    // Process each enrichment
    for (const enrich of enrichments) {
      // Find the row for this firm (case-insensitive partial match)
      const rowIndex = rows.findIndex((row, idx) => 
        idx > 0 && row[companyCol] && 
        row[companyCol].toLowerCase().includes(enrich.firm.toLowerCase())
      );

      if (rowIndex === -1) {
        console.log(`⚠️  Firm not found: ${enrich.firm}`);
        continue;
      }

      // Prepare the update range (row is 1-indexed in Sheets API)
      const rowNum = rowIndex + 1;
      const updates = [];

      if (enrich.contact) {
        updates.push({
          range: `Sheet1!${String.fromCharCode(65 + contactCol)}${rowNum}`,
          values: [[enrich.contact]]
        });
      }

      if (enrich.title) {
        updates.push({
          range: `Sheet1!${String.fromCharCode(65 + titleCol)}${rowNum}`,
          values: [[enrich.title]]
        });
      }

      if (enrich.email) {
        updates.push({
          range: `Sheet1!${String.fromCharCode(65 + emailCol)}${rowNum}`,
          values: [[enrich.email]]
        });
      }

      if (enrich.linkedin) {
        updates.push({
          range: `Sheet1!${String.fromCharCode(65 + linkedinCol)}${rowNum}`,
          values: [[enrich.linkedin]]
        });
      }

      if (enrich.status) {
        updates.push({
          range: `Sheet1!${String.fromCharCode(65 + statusCol)}${rowNum}`,
          values: [[enrich.status]]
        });
      }

      if (enrich.notes) {
        updates.push({
          range: `Sheet1!${String.fromCharCode(65 + portfolioCol)}${rowNum}`,
          values: [[enrich.notes]]
        });
      }

      // Apply all updates for this firm
      if (updates.length > 0) {
        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: SHEET_ID,
          requestBody: {
            valueInputOption: 'RAW',
            data: updates
          }
        });
        
        console.log(`✅ Updated: ${enrich.firm} (row ${rowNum})`);
        updateCount++;
      }
    }

    console.log(`\n🎉 Successfully updated ${updateCount} firms!`);
    
  } catch (error) {
    console.error('Error updating sheet:', error);
    process.exit(1);
  }
}

updateSheet();
