const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const credentials = JSON.parse(fs.readFileSync('service-account.json', 'utf8'));

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

async function enrichManualBatch2() {
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  
  // Read the sheet to find row numbers
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:J'
  });
  
  const rows = response.data.values;
  const updates = [];
  
  const enrichments = [
    {
      company: 'Health Enterprise Partners',
      name: 'Ezra Mehlman',
      title: 'Managing Partner',
      email: 'emehlman@hepfund.com',
      linkedin: 'https://www.linkedin.com/in/ezramehlman/',
      notes: 'Email pattern from RocketReach. Healthcare growth equity, NY-based.',
      source: 'RocketReach pattern'
    },
    {
      company: 'Breakout Capital',
      name: 'Swanand Kelkar',
      title: 'Managing Partner',
      email: 'skelkar@breakout-capital.com',
      linkedin: 'https://www.linkedin.com/in/swanand-kelkar-2b91975/',
      notes: 'Email pattern from ZoomInfo. Emerging markets equity, founded 2022 with Rockefeller Capital.',
      source: 'ZoomInfo pattern'
    },
    {
      company: 'ARCH Venture Partners',
      name: 'Robert Nelsen',
      title: 'Co-Founder & Managing Director',
      email: 'rnelsen@archventure.com',
      linkedin: 'https://www.archventure.com/team/robert-nelsen/',
      notes: 'Email pattern inferred. Life sciences/biotech VC, 150+ companies funded.',
      source: 'Pattern inferred'
    }
  ];
  
  // Find rows for each company
  for (const enrichment of enrichments) {
    const rowIndex = rows.findIndex((row, idx) => 
      idx > 0 && row[0] && row[0].toLowerCase().includes(enrichment.company.toLowerCase())
    );
    
    if (rowIndex > 0) {
      const rowNum = rowIndex + 1;
      console.log(`Found ${enrichment.company} at row ${rowNum}`);
      
      // Update the row (columns C-J: Contact Name, Title, Email, Website, LinkedIn, Sectors, Notes, Status)
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!C${rowNum}:J${rowNum}`,
        valueInputOption: 'RAW',
        resource: {
          values: [[
            enrichment.name,
            enrichment.title,
            enrichment.email,
            rows[rowIndex][1] || '', // Keep existing website
            enrichment.linkedin,
            rows[rowIndex][7] || '', // Keep existing sectors
            enrichment.notes,
            'Enriched'
          ]]
        }
      });
      
      console.log(`✅ Updated ${enrichment.company} (Row ${rowNum})`);
      updates.push(enrichment.company);
    } else {
      console.log(`❌ Could not find ${enrichment.company} in sheet`);
    }
  }
  
  console.log(`\n🎉 Successfully enriched ${updates.length} additional PE firms!`);
  console.log('Updated:', updates.join(', '));
}

enrichManualBatch2().catch(console.error);
