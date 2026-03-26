const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const enrichments = [
  {
    firm: 'Excellere Partners',
    contactName: 'Brad Cornell',
    title: 'Managing Partner',
    email: 'bcornell@excellerepartners.com',
    linkedin: 'https://www.linkedin.com/in/brad-cornell-016325a3',
    status: 'Enriched',
    notes: 'Email pattern from RocketReach/Salesgear (b******@excellerepartners.com, bco*******). Former Lake Capital. Based in Denver. Source: excellere.com + RocketReach 2026-03-17'
  },
  {
    firm: 'Pamlico Capital',
    contactName: 'Watts Hamrick',
    title: 'Managing Partner',
    email: '',
    linkedin: 'https://www.linkedin.com/in/watts-hamrick-98912069',
    status: 'Needs Email',
    notes: 'Confirmed Managing Partner but no direct email found yet. Based in Charlotte. Need to verify domain pattern. Source: pamlicocapital.com 2026-03-17'
  },
  {
    firm: 'Clearview Capital',
    contactName: 'William F. Case Jr.',
    title: 'Managing Partner',
    email: 'wcase@clearviewcap.com',
    linkedin: 'https://www.linkedin.com/in/william-case',
    status: 'Enriched',
    notes: 'Email pattern from RocketReach (w******@clearviewcap.com). 26+ years lower middle-market experience. Based in Stamford, CT. Source: clearviewcap.com + RocketReach 2026-03-17'
  },
  {
    firm: 'Platte River Equity',
    contactName: 'Peter Calamari',
    title: 'Managing Director',
    email: 'pcalamari@platteriverequity.com',
    linkedin: 'https://www.linkedin.com/in/peter-calamari',
    status: 'Enriched',
    notes: 'Email pattern from RocketReach/ZoomInfo (p******@platteriverequity.com). Focus: Industrials sector. Former Vestar Capital, Merrill Lynch M&A. HBS MBA, Yale BA. Source: platteriverequity.com + ZoomInfo 2026-03-17'
  }
];

async function updateSheet() {
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read current sheet data
  const readRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:L'
  });
  
  const rows = readRes.data.values;
  const updates = [];
  
  for (const enrichment of enrichments) {
    // Find the row for this firm
    const rowIndex = rows.findIndex(row => 
      row[0] && row[0].toLowerCase().includes(enrichment.firm.toLowerCase())
    );
    
    if (rowIndex > 0) {
      const rowNum = rowIndex + 1;
      
      // Update columns: B=Contact Name, C=Title, D=Email, F=LinkedIn, I=Status, J=Notes
      updates.push({
        range: `Sheet1!B${rowNum}`,
        values: [[enrichment.contactName]]
      });
      updates.push({
        range: `Sheet1!C${rowNum}`,
        values: [[enrichment.title]]
      });
      if (enrichment.email) {
        updates.push({
          range: `Sheet1!D${rowNum}`,
          values: [[enrichment.email]]
        });
      }
      updates.push({
        range: `Sheet1!F${rowNum}`,
        values: [[enrichment.linkedin]]
      });
      updates.push({
        range: `Sheet1!I${rowNum}`,
        values: [[enrichment.status]]
      });
      updates.push({
        range: `Sheet1!J${rowNum}`,
        values: [[enrichment.notes]]
      });
      
      console.log(`✓ Queued updates for ${enrichment.firm} (row ${rowNum})`);
    } else {
      console.log(`⚠ Could not find ${enrichment.firm} in sheet`);
    }
  }
  
  // Batch update
  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
    console.log(`\n✅ Updated ${enrichments.length} additional firms`);
  }
}

updateSheet().catch(console.error);
