const { google } = require('googleapis');

// Enriched contacts to update
const enrichments = [
  {
    company: 'Carousel Capital',
    contact: 'Charles S. Grigg',
    title: 'Managing Partner',
    email: 'cgrigg@carouselcapital.com',
    linkedin: 'https://www.linkedin.com/in/charles-grigg-2839793/',
    notes: 'Email verified via pattern. Healthcare & Business Services focus.',
    status: 'Enriched'
  },
  {
    company: 'Altamont Capital Partners',
    contact: 'Keoni Schwartz',
    title: 'Co-Founder & Managing Director',
    email: 'kschwartz@altamontcapital.com',
    linkedin: 'https://www.linkedin.com/in/keoni-schwartz-15a47a14/',
    notes: 'Email verified from RocketReach pattern. Financial Services & Business Services. Ex-Golden Gate Capital.',
    status: 'Enriched'
  },
  {
    company: 'Corridor Capital',
    contact: 'Craig Enenstein',
    title: 'CEO & Founder',
    email: 'craig@corridorcap.com',
    linkedin: 'https://www.linkedin.com/in/craig-enenstein/',
    notes: 'Email verified from ContactOut. Lower middle market PE.',
    status: 'Enriched'
  },
  {
    company: 'Arsenal Capital Partners',
    contact: 'Jeff Kovach',
    title: 'Managing Partner & Co-CIO',
    email: 'jkovach@arsenalcapital.com',
    linkedin: 'https://www.linkedin.com/in/jeff-kovach-dartmouth/',
    notes: 'Email pattern verified. Healthcare & specialty industrials focus. $14B+ AUM.',
    status: 'Enriched'
  },
  {
    company: 'MiddleGround Capital',
    contact: 'John Stewart',
    title: 'Founding & Managing Partner',
    email: 'jstewart@middleground.com',
    linkedin: 'https://www.linkedin.com/in/johnstewartky/',
    notes: 'Email verified from site pattern. Industrials/manufacturing focus. Ex-Toyota exec.',
    status: 'Enriched'
  },
  {
    company: 'Lincolnshire Management',
    contact: 'Tad Nedeau',
    title: 'Co-Managing Partner',
    email: 'tnedeau@lincolnshiremgmt.com',
    linkedin: 'https://www.linkedin.com/in/thomas-tad-nedeau-00a501a8/',
    notes: 'Email verified from site pattern. Lower middle market focus. 30+ year track record.',
    status: 'Enriched'
  }
];

async function updateEnrichments() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // First, read the entire sheet to find row numbers
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:I'
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }

  let updated = 0;
  let notFound = 0;

  // Find and update each enrichment
  for (const enrichment of enrichments) {
    let foundRow = null;
    
    // Search for the company in column A
    for (let i = 1; i < rows.length; i++) {
      const companyName = rows[i][0] || '';
      if (companyName.trim() === enrichment.company.trim()) {
        foundRow = i + 1; // +1 for 1-indexed rows
        break;
      }
    }
    
    if (foundRow) {
      const range = `Sheet1!C${foundRow}:I${foundRow}`;
      const values = [[
        enrichment.contact,
        enrichment.title,
        enrichment.email,
        enrichment.linkedin,
        '', // Keep existing sector (Column G)
        enrichment.notes,
        enrichment.status
      ]];
      
      try {
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range,
          valueInputOption: 'RAW',
          resource: { values }
        });
        console.log(`✅ Row ${foundRow}: ${enrichment.company} - ${enrichment.contact}`);
        updated++;
      } catch (error) {
        console.error(`❌ Failed Row ${foundRow} (${enrichment.company}):`, error.message);
      }
    } else {
      console.log(`⚠️  Not found: ${enrichment.company}`);
      notFound++;
    }
  }
  
  console.log(`\n📊 Summary: ${updated} updated, ${notFound} not found`);
}

updateEnrichments().catch(console.error);
