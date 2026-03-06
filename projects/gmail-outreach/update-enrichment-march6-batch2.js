const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const credentials = JSON.parse(fs.readFileSync('service-account.json', 'utf8'));

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

async function findAndUpdateFirms() {
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  
  // First, get all the data to find row numbers
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:K'
  });
  
  const rows = response.data.values;
  
  // NaviMed Capital with verified emails from website
  const enrichments = [
    {
      firmName: 'NaviMed Capital',
      contactName: 'Ryan Schwarz',
      title: 'Managing Director',
      email: 'ryan.schwarz@navimed.com',
      linkedin: 'https://www.linkedin.com/pub/ryan-schwarz/40/85a/528',
      status: 'Enriched',
      notes: 'MD with 30yrs healthcare PE experience, ex-Carlyle. Also: Bijan Salehizadeh MD (bijan@navimed.com), Brian Canann MD-Portfolio Ops (brian.canann@navimed.com), Ryan Ross MD (ryan.ross@navimed.com). All emails verified from official website.'
    },
    {
      firmName: 'Marlin Equity Partners',
      contactName: 'Nick Kaiser',
      title: 'Co-Founder & Senior Managing Director',
      email: '', // No direct email found
      linkedin: '',
      status: 'Partial',
      notes: 'Co-founders: Nick Kaiser, David McGovern, Brent Reese. Roland Pezzutto (Managing Director). $10B+ software & tech PE firm. No direct emails found on official sources.'
    },
    {
      firmName: 'NewSpring Capital',
      contactName: 'Marc Lederman',
      title: 'Co-Founder & General Partner',
      email: '',
      linkedin: '',
      status: 'Partial',
      notes: 'Co-founder Marc Lederman (GP, serves on investment committee). Skip Maner (GP, founder of NewSpring Holdings). Kapila Ratnam PhD (GP, healthcare focus). No direct emails found.'
    },
    {
      firmName: 'Juggernaut Capital Partners',
      contactName: 'John Shulman',
      title: 'Founder & Managing Partner',
      email: '',
      linkedin: '',
      status: 'Partial',
      notes: 'Founder John Shulman. Team: Kevin Phan (VP), Matt Buckley (CFO), Ryan Osgood (Principal), Tania King (Operating Advisor). Consumer & healthcare focus. No direct emails found.'
    }
  ];
  
  const updates = [];
  
  for (const enrichment of enrichments) {
    // Find the row for this firm
    const rowIndex = rows.findIndex(row => row[0] && row[0].toLowerCase().includes(enrichment.firmName.toLowerCase()));
    
    if (rowIndex === -1) {
      console.log(`⚠️  Could not find ${enrichment.firmName} in sheet`);
      continue;
    }
    
    const rowNumber = rowIndex + 1;
    console.log(`Found ${enrichment.firmName} at row ${rowNumber}`);
    
    // Prepare updates
    if (enrichment.contactName) {
      updates.push({
        range: `Sheet1!C${rowNumber}`,
        values: [[enrichment.contactName]]
      });
    }
    
    if (enrichment.title) {
      updates.push({
        range: `Sheet1!D${rowNumber}`,
        values: [[enrichment.title]]
      });
    }
    
    if (enrichment.email) {
      updates.push({
        range: `Sheet1!E${rowNumber}`,
        values: [[enrichment.email]]
      });
    }
    
    if (enrichment.linkedin) {
      updates.push({
        range: `Sheet1!F${rowNumber}`,
        values: [[enrichment.linkedin]]
      });
    }
    
    if (enrichment.notes) {
      updates.push({
        range: `Sheet1!I${rowNumber}`,
        values: [[enrichment.notes]]
      });
    }
    
    if (enrichment.status) {
      updates.push({
        range: `Sheet1!J${rowNumber}`,
        values: [[enrichment.status]]
      });
    }
  }
  
  // Execute all updates
  for (const update of updates) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: update.range,
      valueInputOption: 'RAW',
      resource: {
        values: update.values
      }
    });
    console.log(`✓ Updated ${update.range}`);
  }
  
  console.log(`\n✅ Successfully enriched ${enrichments.length} more firms`);
  console.log('📊 Total enriched this session: ' + (4 + enrichments.length) + ' firms');
}

findAndUpdateFirms().catch(console.error);
