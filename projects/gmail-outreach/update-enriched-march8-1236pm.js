const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Enrichments from manual web research - March 8, 2026 12:36 PM
const enrichments = [
  {
    firm: 'Aeris Partners',
    contactName: 'David W. Joncas',
    title: 'Managing Director & Co-Founder',
    email: 'dwj@aerispartners.com',
    linkedin: 'https://www.linkedin.com/in/david-joncas-206a0424/',
    notes: 'Tech M&A investment bank, FINRA/SIPC member. Email verified ContactOut.',
    source: 'ContactOut + company website'
  },
  {
    firm: 'Apex Service Partners',
    contactName: 'AJ Brown',
    title: 'CEO & Executive Chairman',
    email: 'ajbrown@apexservicepartners.com',
    linkedin: 'https://www.linkedin.com/in/ajbrown16/',
    notes: 'HVAC/Plumbing/Electrical platform backed by Alpine Investors. Email verified ContactOut.',
    source: 'ContactOut + TheOrg'
  },
  {
    firm: 'Valiant Capital',
    contactName: 'Lou Gonzalez',
    title: 'Managing Partner & Co-Founder',
    email: 'lou@valiant-capital.com',
    linkedin: 'https://www.linkedin.com/in/lou-gonzalez-36b96212/',
    notes: 'Real estate and finance focus, Houston-based. Email inferred from company pattern.',
    source: 'Company website team page'
  }
];

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Read current sheet data
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:L'
  });

  const rows = response.data.values;
  const updates = [];

  enrichments.forEach(enrichment => {
    // Find row by firm name (column A)
    const rowIndex = rows.findIndex(row => 
      row[0] && row[0].toLowerCase().includes(enrichment.firm.toLowerCase())
    );

    if (rowIndex > 0) { // Skip header
      console.log(`Found ${enrichment.firm} at row ${rowIndex + 1}`);
      
      // Update: B=Contact, C=Title, D=Email, E=LinkedIn, F=Notes, G=Status
      updates.push({
        range: `Sheet1!B${rowIndex + 1}:G${rowIndex + 1}`,
        values: [[
          enrichment.contactName,
          enrichment.title,
          enrichment.email,
          enrichment.linkedin,
          enrichment.notes,
          'Enriched'
        ]]
      });
    } else {
      console.log(`⚠️  Could not find ${enrichment.firm} in sheet`);
    }
  });

  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      resource: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
    console.log(`\n✅ Updated ${updates.length} rows in Google Sheet`);
  } else {
    console.log('\n❌ No matching rows found');
  }
}

updateSheet().catch(console.error);
