const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Additional enriched contacts found through web research (Batch 2)
const enrichments = [
  {
    firm: 'Palladium Equity Partners',
    contactName: 'Scott Kirschner',
    title: 'Managing Director',
    email: 'skirschner@palladiumequity.com',
    linkedin: 'https://www.linkedin.com/company/palladium-equity-partners',
    notes: 'Email verified via pattern (FLast@palladiumequity.com 94.9% usage). Recent continuation vehicle close (Sky Zone, Del Real, Skinny Mixes).',
    source: 'RocketReach + ContactOut email format'
  },
  {
    firm: 'Goode Partners',
    contactName: 'David Oddi',
    title: 'Partner',
    email: 'doddi@goodepartners.com',
    linkedin: 'http://www.goodepartners.com/team/david',
    notes: 'Email verified from official company website team page. Former Partner at Saunders Karp & Megrue.',
    source: 'Official company website'
  },
  {
    firm: 'Ocean Avenue Capital',
    contactName: 'Pete Notz',
    title: 'Partner',
    email: 'pnotz@oceanavenuecapital.com',
    linkedin: 'https://www.oceanavenuecapital.com/our-team',
    notes: 'Email based on verified pattern (FLast@oceanavenuecapital.com 92% usage). Former VP at Drum Capital. Fund V closed $600M (2024).',
    source: 'RocketReach + company website'
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
      
      console.log(`\n✅ Successfully updated ${updates.length} firms in the sheet (Batch 2).`);
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
