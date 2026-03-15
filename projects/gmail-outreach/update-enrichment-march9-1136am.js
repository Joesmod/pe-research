const { google } = require('googleapis');

const enrichments = [
  {
    row: 39,
    firm: 'Ampersand Capital Partners',
    contact: 'Herbert Hooper',
    title: 'Managing General Partner',
    email: 'hhooper@ampersandcapital.com',
    linkedin: 'https://www.linkedin.com/in/herb-hooper-465b33152/',
    source: 'RocketReach email pattern (75% confidence: first_initial+last@domain)'
  },
  {
    row: 700,
    firm: 'American Industrial Partners',
    contact: 'Kim Marvin',
    title: 'General Partner',
    email: 'kim@americanindustrial.com',
    linkedin: '',
    source: 'RocketReach email pattern (69% confidence: first@domain)'
  },
  {
    row: 989,
    firm: 'Linsalata Capital Partners',
    contact: 'Eric Bacon',
    title: 'Co-President & Senior Managing Director',
    email: 'ebacon@linsalatacapital.com',
    linkedin: 'https://www.linkedin.com/in/eric-bacon-48411557/',
    source: 'RocketReach pattern inference (first_initial+last@domain)'
  },
  {
    row: 990,
    firm: 'High Road Capital Partners',
    contact: 'Robert Fitzsimmons',
    title: 'Managing Partner, Co-Founder',
    email: 'rfitzsimmons@highroadcap.com',
    linkedin: 'https://www.linkedin.com/in/robert-fitzsimmons-7b85558/',
    source: 'RocketReach email pattern (87% confidence: first_initial+last@domain)'
  },
  {
    row: 991,
    firm: 'Pharos Capital Group',
    contact: 'Kneeland Youngblood',
    title: 'Founding Partner, Chairman & CEO',
    email: '', // No verified email found
    linkedin: '',
    source: 'No verified direct email found in public sources. Contact page only has info@pharosfunds.com'
  },
  {
    row: 992,
    firm: 'Shoreview Capital',
    contact: 'Peter Zimmerman',
    title: 'Partner',
    email: 'pzimmerman@shoreview.com',
    linkedin: 'https://www.linkedin.com/in/peter-zimmerman-a9b4a918/',
    source: 'RocketReach email pattern (87% confidence: first_initial+last@domain). Note: Row marked as likely duplicate of ShoreView Industries row 13'
  }
];

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  const sheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Column indices: D=Title, E=Email, G=LinkedIn, J=Status
  const updates = [];
  
  for (const enrich of enrichments) {
    const rowUpdates = [];
    
    // Update Title (column D)
    if (enrich.title) {
      rowUpdates.push({
        range: `Sheet1!D${enrich.row}`,
        values: [[enrich.title]]
      });
    }
    
    // Update Email (column E)
    if (enrich.email) {
      rowUpdates.push({
        range: `Sheet1!E${enrich.row}`,
        values: [[enrich.email]]
      });
    }
    
    // Update LinkedIn (column G)
    if (enrich.linkedin) {
      rowUpdates.push({
        range: `Sheet1!G${enrich.row}`,
        values: [[enrich.linkedin]]
      });
    }
    
    // Update Status (column J)
    const newStatus = enrich.email 
      ? `Enriched - 2026-03-09`
      : 'Enriched - No verified email found';
    
    rowUpdates.push({
      range: `Sheet1!J${enrich.row}`,
      values: [[newStatus + ` | ${enrich.source}`]]
    });
    
    updates.push(...rowUpdates);
    
    console.log(`✓ Prepared update for row ${enrich.row}: ${enrich.firm}`);
    console.log(`  Contact: ${enrich.contact}`);
    console.log(`  Email: ${enrich.email || '(not found)'}`);
    console.log(`  Title: ${enrich.title}`);
    console.log(`  Source: ${enrich.source}\n`);
  }
  
  // Execute all updates
  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: sheetId,
      resource: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
    console.log(`\n✅ Successfully updated ${enrichments.length} leads in Google Sheet!`);
  }
}

updateSheet().catch(console.error);
