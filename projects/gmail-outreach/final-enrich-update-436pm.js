const { google } = require('googleapis');

// Additional enrichment findings from web research
const enrichments = [
  {
    row: 374,
    contactName: 'Christopher Lee',
    title: 'Co-Founder & Managing Partner',
    email: 'clee@infinitycappartners.com',
    linkedin: 'https://www.linkedin.com/in/christopher-lee-infinity',
    notes: 'Verified from infinitycappartners.com/christopher-lee'
  },
  {
    row: 624,
    contactName: 'John DeLoche',
    title: 'Co-Founder & Managing Partner',
    email: 'john@invictusgrowth.com',
    linkedin: 'https://www.linkedin.com/in/johndeloche/',
    notes: 'Verified from Crunchbase + PRNewswire announcement'
  },
  {
    row: 628,
    contactName: 'Scott Neuberger',
    title: 'Co-Founder & Managing Partner',
    email: 'scott@karmelcap.com',
    linkedin: 'https://www.linkedin.com/in/scottneuberger/',
    notes: 'Verified from Crunchbase + Business Wire + RocketReach'
  },
  {
    row: 633,
    contactName: 'Joseph Greenwood',
    title: 'Partner (Chicago)',
    email: 'greenwood@livingstonepartners.com',
    linkedin: 'https://www.linkedin.com/in/joseph-greenwood-livingstone',
    notes: 'Verified from livingstonepartners.com/en-us/team/joseph-greenwood/'
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
    // Contact Name
    updates.push({
      range: `Sheet1!${String.fromCharCode(65 + idx.contactName)}${enrich.row}`,
      values: [[enrich.contactName]]
    });
    
    // Title
    updates.push({
      range: `Sheet1!${String.fromCharCode(65 + idx.title)}${enrich.row}`,
      values: [[enrich.title]]
    });
    
    // LinkedIn
    if (enrich.linkedin) {
      updates.push({
        range: `Sheet1!${String.fromCharCode(65 + idx.linkedin)}${enrich.row}`,
        values: [[enrich.linkedin]]
      });
    }
    
    // Status
    updates.push({
      range: `Sheet1!${String.fromCharCode(65 + idx.status)}${enrich.row}`,
      values: [['Enriched']]
    });
    
    // Notes
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
  console.log(`\n=== ADDITIONAL ENRICHMENTS ===`);
  enrichments.forEach((e, i) => {
    console.log(`${i + 1}. ${e.contactName} - ${e.title} | ${e.email}`);
  });
}

applyEnrichments().catch(console.error);
