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
  
  // Define enrichments (we'll search for the firm and update)
  const enrichments = [
    {
      firmName: 'Great Range Capital',
      contactName: 'Ryan Sprott',
      title: 'Co-Founder & Managing Partner',
      email: '', // Don't have verified email from official source
      linkedin: 'https://www.linkedin.com/in/ryan-sprott-07159412/',
      status: 'Partial',
      notes: 'Ryan Sprott co-founded GRC in 2010. Email pattern likely {first}.{last}@greatrangecapital.com but not confirmed from official source.'
    },
    {
      firmName: 'HPS Investment Partners',
      contactName: 'Catherine LaGreca',
      title: 'Managing Director, Strategic Financing',
      email: '', // Don't have verified email
      linkedin: '', // Not on public team page
      status: 'Partial',
      notes: 'Found on HPS team page. Also: Emily Wang (MD, Biz Dev, SF), Mark Rubenstein (MD, Strategic Investment Partners, NY). No direct emails found on official sources.'
    },
    {
      firmName: 'I Squared Capital',
      contactName: 'Gautam Bhandari',
      title: 'Co-Founder & Managing Partner',
      email: '', // Don't have verified email
      linkedin: '',
      status: 'Partial',
      notes: 'Co-founder with Sadek Wahba. Senior Partners: Harsh Agrawal, Mohamed El Gazzar. MDs: Kunal Agarwal, Ashish Agarwal, Tim Formuziewich. No direct emails found.'
    },
    {
      firmName: 'Lee Equity Partners',
      contactName: 'Mark Gormley',
      title: 'Partner',
      email: '', // Don't have verified email
      linkedin: '',
      status: 'Partial',
      notes: 'Partners include: Christian Chauvet, Benjamin Hochberg, Thomas Holdstein, Yoo Jin Kim, Mark Mauceri, Daniel Rodriguez, Collins Ward, Joseph Rotberg (Partner/CFO/CCO). General email: LeeEquityPartners@LeeEquity.com'
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
    
    const rowNumber = rowIndex + 1; // Convert to 1-based index
    console.log(`Found ${enrichment.firmName} at row ${rowNumber}`);
    
    // Prepare updates (only update if we have data and it's not already filled)
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
  
  console.log(`\n✅ Enriched ${enrichments.length} firms with updated contact info`);
}

findAndUpdateFirms().catch(console.error);
