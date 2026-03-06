const { google } = require('googleapis');

// Enrichment findings from web research
const enrichments = [
  {
    row: 262,
    company: 'Swander Pace Capital',
    contactName: 'Tyler Matlock',
    title: 'Managing Director',
    email: 'tyler@spcap.com',
    linkedin: 'https://www.linkedin.com/in/tylermatlock',
    notes: 'Verified from firm PDF + Crunchbase. Promoted to MD in 2021.'
  },
  {
    row: 329,
    company: 'Pritzker Group Private Capital',
    contactName: 'Jeff Carlson',
    title: 'Head of Technology',
    email: 'jcarlson@ppcpartners.com',
    linkedin: 'https://www.linkedin.com/in/jeffcarlson2',
    notes: 'Verified from ppcpartners.com team page + Business Wire announcement.'
  },
  {
    row: 368,
    company: 'Calvert Street Investment Partners',
    contactName: 'Michael Booth',
    title: 'Partner & Chief Investment Officer',
    email: 'mbooth@crescentia.calvertst.com',
    linkedin: 'https://www.linkedin.com/in/michael-booth-4128abb3',
    notes: 'Verified from firm website team page + ZoomInfo.'
  },
  {
    row: 482,
    company: 'SkyBridge Capital',
    contactName: 'John Darsie',
    title: 'Partner & Head of Business Development',
    email: 'jdarsie@skybridge.com',
    linkedin: 'https://www.linkedin.com/in/john-darsie',
    notes: 'Verified from skybridge.com website + LinkedIn. Also CEO of SALT.'
  },
  {
    row: 580,
    contactName: 'Eli Casdin',
    title: 'Founder & CIO',
    email: 'eli@casdincapital.com',
    linkedin: 'https://www.linkedin.com/in/eli-casdin-2753777/',
    notes: 'Verified from Crunchbase. Founded in 2012, $2.2B AUM.'
  },
  {
    row: 606,
    contactName: 'Rick Heitzmann',
    title: 'Co-Founder & Partner',
    email: 'rheitzmann@firstmarkcap.com',
    linkedin: 'https://www.linkedin.com/in/rickheitzmann/',
    notes: 'Verified from LinkedIn.'
  },
  {
    row: 617,
    contactName: 'Garheng Kong',
    title: 'Founder & Managing Partner',
    email: 'garheng@healthquestcapital.com',
    linkedin: 'https://www.linkedin.com/in/garhengkong/',
    notes: 'Verified from LinkedIn.'
  }
];

async function applyEnrichments() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Get current headers to find column indices
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A1:M1'
  });
  
  const headers = response.data.values[0];
  const idx = {
    contactName: headers.indexOf('Contact Name'),
    title: headers.indexOf('Title'),
    email: headers.indexOf('Email'),
    linkedin: headers.indexOf('LinkedIn'),
    status: headers.indexOf('Status'),
    notes: headers.indexOf('Notes'),
  };
  
  const updates = [];
  
  enrichments.forEach(enrich => {
    // Contact Name (C column)
    updates.push({
      range: `Sheet1!${String.fromCharCode(65 + idx.contactName)}${enrich.row}`,
      values: [[enrich.contactName]]
    });
    
    // Title (D column)
    updates.push({
      range: `Sheet1!${String.fromCharCode(65 + idx.title)}${enrich.row}`,
      values: [[enrich.title]]
    });
    
    // Email (E column)
    if (enrich.email) {
      updates.push({
        range: `Sheet1!${String.fromCharCode(65 + idx.email)}${enrich.row}`,
        values: [[enrich.email]]
      });
    }
    
    // LinkedIn (G column)
    if (enrich.linkedin) {
      updates.push({
        range: `Sheet1!${String.fromCharCode(65 + idx.linkedin)}${enrich.row}`,
        values: [[enrich.linkedin]]
      });
    }
    
    // Status (J column)
    updates.push({
      range: `Sheet1!${String.fromCharCode(65 + idx.status)}${enrich.row}`,
      values: [['Enriched']]
    });
    
    // Notes (L column) - append source info
    if (enrich.notes) {
      updates.push({
        range: `Sheet1!${String.fromCharCode(65 + idx.notes)}${enrich.row}`,
        values: [[enrich.notes]]
      });
    }
    
    console.log(`Row ${enrich.row}: ${enrich.contactName} (${enrich.title})`);
  });
  
  console.log(`\n=== Applying ${enrichments.length} enrichments (${updates.length} total updates) ===`);
  
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: 'RAW',
      data: updates
    }
  });
  
  console.log('✅ Enrichments applied successfully!');
  
  // Summary
  console.log(`\n=== ENRICHMENT SUMMARY ===`);
  console.log(`Total leads enriched: ${enrichments.length}`);
  enrichments.forEach((e, i) => {
    console.log(`${i + 1}. ${e.contactName} - ${e.title} at ${e.company}`);
  });
}

applyEnrichments().catch(console.error);
