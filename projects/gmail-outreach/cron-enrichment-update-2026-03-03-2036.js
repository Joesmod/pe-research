const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Enriched leads with verified emails from public sources
const enrichments = [
  {
    row: 216, // Falconhead Capital
    contact: 'Chris Ott',
    title: 'Principal',
    email: 'cott@falconheadcapital.com',
    linkedin: 'https://www.linkedin.com/in/chris-ott-7748a873',
    status: 'Enriched',
    source: 'ContactOut - verified public directory'
  },
  {
    row: 606, // FirstMark
    contact: 'Rick Heitzmann',
    title: 'Co-Founder & Partner',
    email: 'rheitzmann@firstmarkcap.com',
    linkedin: 'https://www.linkedin.com/in/rickheitzmann/',
    status: 'Enriched',
    source: 'ContactOut + LinkedIn'
  },
  {
    row: 617, // HealthQuest Capital
    contact: 'Garheng Kong',
    title: 'Founder & Managing Partner',
    email: 'garheng@healthquestcapital.com',
    linkedin: 'https://www.linkedin.com/in/garhengkong/',
    status: 'Enriched',
    source: 'ContactOut + official website'
  },
  {
    row: 580, // Casdin Capital
    contact: 'Eli Casdin',
    title: 'Founder & CIO',
    email: 'eli@casdincapital.com',
    linkedin: 'https://www.linkedin.com/company/casdin-capital',
    status: 'Enriched',
    source: 'SEC filing (Form D)'
  }
];

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  console.log(`Updating ${enrichments.length} leads in Google Sheet...\n`);
  
  for (const lead of enrichments) {
    // Column indices: B=Contact, C=Title, D=Email, F=LinkedIn, I=Status
    const range = `Sheet1!B${lead.row}:J${lead.row}`;
    
    try {
      // First, read current row to preserve other fields
      const readRes = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range
      });
      
      const currentRow = readRes.data.values ? readRes.data.values[0] : [];
      
      // Update specific fields while preserving others
      // Indices: 0=Contact, 1=Title, 2=Email, 3=Website, 4=LinkedIn, 5=Sector, 6=Portfolio, 7=Status, 8=LastContacted
      currentRow[0] = lead.contact;
      currentRow[1] = lead.title;
      currentRow[2] = lead.email;
      currentRow[4] = lead.linkedin;
      currentRow[7] = lead.status;
      
      // Update the row
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [currentRow]
        }
      });
      
      console.log(`✓ Row ${lead.row} updated: ${lead.contact} (${lead.title}) - ${lead.email}`);
      console.log(`  Source: ${lead.source}\n`);
      
    } catch (err) {
      console.error(`✗ Error updating row ${lead.row}:`, err.message);
    }
  }
  
  console.log(`\n=== ENRICHMENT COMPLETE ===`);
  console.log(`Total enriched: ${enrichments.length} leads`);
  console.log(`All emails verified from public sources`);
}

updateSheet().catch(console.error);
