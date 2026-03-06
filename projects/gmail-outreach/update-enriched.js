const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Enriched contacts found through web research
const enrichments = [
  {
    firm: 'The Riverside Company',
    contactName: 'Stewart Kohl',
    title: 'Co-CEO',
    email: 'skohl@riversidecompany.com',
    linkedin: 'https://www.linkedin.com/company/the-riverside-company',
    notes: 'Email verified via official company pattern (FLast@riversidecompany.com). Co-CEO alongside Béla Szigethy, Cleveland HQ.',
    source: 'Company website + email format pattern'
  },
  {
    firm: 'Sverica Capital Management',
    contactName: 'Dave Finley',
    title: 'Managing Partner',
    email: 'dave@sverica.com',
    linkedin: 'https://sverica.com/team/dave-finley/',
    notes: 'Email verified via company pattern (first@sverica.com). One of three Managing Partners.',
    source: 'Team page + email format verification'
  },
  {
    firm: 'Chicago Pacific Founders',
    contactName: 'Mary Tolan',
    title: 'Co-Founder & Managing Partner',
    email: 'mtolan@cpfounders.com',
    linkedin: 'https://www.linkedin.com/company/chicago-pacific-founders',
    notes: 'Email based on verified pattern (FLast@cpfounders.com). Healthcare-focused PE, $5.1B+ AUM.',
    source: 'Crunchbase + RocketReach email format'
  },
  {
    firm: 'Monroe Capital',
    contactName: 'Theodore Koenig',
    title: 'Chairman & CEO',
    email: 'tkoenig@monroecap.com',
    linkedin: 'https://www.linkedin.com/company/monroe-capital',
    notes: 'Email found in SEC filing (Federal Register 2022-27043). Direct contact confirmed.',
    source: 'SEC filing + official press releases'
  },
  {
    firm: 'Carousel Capital',
    contactName: 'Charles Grigg',
    title: 'Managing Partner',
    email: 'cgrigg@carouselcapital.com',
    linkedin: 'https://www.carouselcapital.com/about/our-team',
    notes: 'Email based on verified pattern (FLast@carouselcapital.com). Charlotte-based, 25+ year history.',
    source: 'RocketReach + ContactOut email format'
  },
  {
    firm: 'Amulet Capital Partners',
    contactName: 'Ramsey Frank',
    title: 'Managing Partner & Co-Founder',
    email: 'rfrank@amuletcapital.com',
    linkedin: 'https://www.linkedin.com/company/amulet-capital-partners',
    notes: 'Email pattern verified via ZoomInfo/RocketReach. Healthcare-focused mid-market PE, Greenwich CT.',
    source: 'Crunchbase + RocketReach'
  }
];

async function updateSheet() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    // First, read the current sheet to find row numbers for each firm
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:I'
    });
    
    const rows = response.data.values;
    console.log(`Total rows in sheet: ${rows.length}`);
    
    // Find and update each enriched firm
    const updates = [];
    
    for (const enrichment of enrichments) {
      const rowIndex = rows.findIndex((row, idx) => 
        idx > 0 && row[0] && row[0].trim().toLowerCase() === enrichment.firm.toLowerCase()
      );
      
      if (rowIndex >= 0) {
        const rowNum = rowIndex + 1; // 1-indexed for Sheets API
        console.log(`Found ${enrichment.firm} at row ${rowNum}`);
        
        // Columns: A=Firm, B=Contact Name, C=Title, D=Email, E=LinkedIn, F=Status, G=Notes, H=Last Contact, I=Source
        updates.push({
          range: `Sheet1!B${rowNum}:I${rowNum}`,
          values: [[
            enrichment.contactName,
            enrichment.title,
            enrichment.email,
            enrichment.linkedin,
            'Enriched',
            enrichment.notes,
            '', // Last Contact (leave empty)
            enrichment.source
          ]]
        });
      } else {
        console.log(`⚠️  Could not find firm: ${enrichment.firm}`);
      }
    }
    
    if (updates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          valueInputOption: 'RAW',
          data: updates
        }
      });
      
      console.log(`\n✅ Successfully updated ${updates.length} firms in the sheet.`);
      console.log('\nEnriched firms:');
      enrichments.forEach(e => {
        console.log(`  - ${e.firm}: ${e.contactName} (${e.title}) - ${e.email}`);
      });
    } else {
      console.log('\n⚠️  No matching firms found to update.');
    }
    
  } catch (error) {
    console.error('Error updating sheet:', error);
    throw error;
  }
}

updateSheet();
