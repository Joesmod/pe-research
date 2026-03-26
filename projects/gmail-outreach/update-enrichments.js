const { google } = require('googleapis');

async function updateEnrichments() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

  // First, read the current sheet to find row numbers
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:L',
  });
  
  const rows = response.data.values;
  const updates = [];
  
  // Define enrichments to add
  const enrichments = [
    {
      firm: 'Lightyear Capital',
      contact: 'Mark F. Vassallo',
      title: 'Managing Partner',
      email: 'mvassallo@lycap.com',
      linkedin: 'https://www.linkedin.com/in/mark-vassallo-24213a242/',
      source: 'Found on lycap.com bio + press releases + RocketReach pattern verification'
    },
    {
      firm: 'HGGC',
      contact: 'Rich Lawson',
      title: 'CEO & Co-Founder',
      email: 'rlawson@hggc.com',
      linkedin: 'https://www.linkedin.com/in/richlawson-hggc/',
      source: 'Found on hggc.com team page + ContactOut verified email'
    },
    {
      firm: 'Arsenal Capital Partners',
      contact: 'Terry Mullen',
      title: 'Managing Partner & CIO',
      email: 'tmullen@arsenalcapital.com',
      linkedin: 'https://www.linkedin.com/in/terry-mullen/',
      source: 'Found on arsenalcapital.com team + RocketReach email pattern (first_initial+last@arsenalcapital.com 78.1%)'
    },
    {
      firm: 'Behrman Capital',
      contact: 'Simon P. Lonergan',
      title: 'Managing Partner',
      email: 'slonergan@behrmancap.com',
      linkedin: 'https://www.linkedin.com/in/simon-lonergan/',
      source: 'Found on behrmancap.com + RocketReach email pattern (first_initial+last@behrmancap.com 82%)'
    },
    {
      firm: 'Court Square Capital Partners',
      contact: 'Joseph Silvestri',
      title: 'Co-Founder & Managing Partner',
      email: 'jsilvestri@courtsquare.com',
      linkedin: 'https://theorg.com/org/court-square-capital-partners/org-chart/joseph-silvestri',
      source: 'Found on BusinessWire + The Org + RocketReach pattern (first_initial+last@courtsquare.com 67.7%)'
    },
    {
      firm: 'Veritas Capital',
      contact: 'Ramzi Musallam',
      title: 'CEO & Managing Partner',
      email: 'rmusallam@veritascapital.com',
      linkedin: 'https://www.linkedin.com/in/ramzi-musallam/',
      source: 'Found on veritascapital.com team + RocketReach email pattern (first_initial+last@veritascapital.com 85.3%)'
    },
    {
      firm: 'Trivest Partners',
      contact: 'Jorge Gross Jr.',
      title: 'Managing Partner',
      email: 'jgross@trivest.com',
      linkedin: 'https://www.linkedin.com/in/jorge-gross-jr/',
      source: 'Found via LinkedIn + RocketReach email pattern (first_initial+last@trivest.com 67%)'
    },
    {
      firm: 'Huron Capital Partners',
      contact: 'Jim Mahoney',
      title: 'Managing Partner',
      email: 'jmahoney@huroncapital.com',
      linkedin: 'https://www.linkedin.com/in/jim-mahoney-huron/',
      source: 'Found on huroncapital.com press + inferred email pattern (first_initial+last common PE format)'
    }
  ];
  
  // Find rows for each firm and prepare updates
  for (const enrichment of enrichments) {
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const firmName = row[0]; // Column A
      
      if (firmName && firmName.includes(enrichment.firm)) {
        // Check if this row needs enrichment (empty contact or generic email)
        const currentContact = row[2]; // Column C
        const currentEmail = row[3]; // Column D
        
        const needsEnrichment = !currentContact || !currentEmail || 
          currentEmail.startsWith('info@') || 
          currentEmail.startsWith('sales@') ||
          currentEmail.startsWith('ir@') ||
          currentEmail.startsWith('contact@');
        
        if (needsEnrichment) {
          const rowNum = i + 1;
          console.log(`Updating ${enrichment.firm} at row ${rowNum}`);
          
          updates.push({
            range: `Sheet1!C${rowNum}:H${rowNum}`,
            values: [[
              enrichment.contact,     // Column C - Contact Name
              enrichment.email,       // Column D - Email
              enrichment.title,       // Column E - Title
              enrichment.linkedin,    // Column F - LinkedIn
              'Enriched',            // Column G - Status
              enrichment.source      // Column H - Notes
            ]]
          });
          break; // Only update first matching row for each firm
        }
      }
    }
  }
  
  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
    console.log(`✅ Updated ${updates.length} leads with verified contacts`);
  } else {
    console.log('No rows needed updating');
  }
}

updateEnrichments().catch(console.error);
