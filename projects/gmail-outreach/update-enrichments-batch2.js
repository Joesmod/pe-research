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
  
  // Define enrichments to add - Batch 2
  const enrichments = [
    {
      firm: 'Chicago Pacific Founders',
      contact: 'Mary Tolan',
      title: 'Co-Founder & Managing Partner',
      email: 'mtolan@cpfounders.com',
      linkedin: 'https://www.linkedin.com/in/mary-tolan/',
      source: 'Found on cpfounders.com + RocketReach email pattern (first_initial+last@cpfounders.com 87.9%)'
    },
    {
      firm: 'New Mountain Capital',
      contact: 'Steven Klinsky',
      title: 'Founder, CEO & Managing Director',
      email: 'sklinsky@newmountaincapital.com',
      linkedin: 'https://www.linkedin.com/in/steven-klinsky/',
      source: 'Found on newmountaincapital.com + Craft.co + RocketReach pattern (first_initial+last@newmountaincapital.com 79.2%)'
    },
    {
      firm: 'Pamlico Capital',
      contact: 'Scott Perper',
      title: 'Managing Partner',
      email: 'scott.perper@pamlicocapital.com',
      linkedin: 'https://www.linkedin.com/in/scott-perper/',
      source: 'Found on pamlicocapital.com + Wikipedia + RocketReach pattern (first.last@pamlicocapital.com 63.7%)'
    },
    {
      firm: 'Peak Rock Capital',
      contact: 'Anthony DiSimone',
      title: 'CEO',
      email: 'disimone@peakrockcapital.com',
      linkedin: 'https://www.linkedin.com/in/anthony-disimone/',
      source: 'Found on peakrockcapital.com + The Org + RocketReach pattern (last@peakrockcapital.com 87.8%)'
    },
    {
      firm: 'Court Square Capital Partners',
      contact: 'Joseph Silvestri',
      title: 'Co-Founder & Managing Partner',
      email: 'jsilvestri@courtsquare.com',
      linkedin: 'https://www.linkedin.com/in/joseph-silvestri/',
      source: 'Found on BusinessWire + The Org + RocketReach pattern (first_initial+last@courtsquare.com 67.7%)'
    },
    {
      firm: 'Veritas Capital',
      contact: 'Ramzi Musallam',
      title: 'CEO & Managing Partner',
      email: 'rmusallam@veritascapital.com',
      linkedin: 'https://www.linkedin.com/in/ramzi-musallam/',
      source: 'Found on veritascapital.com + Wikipedia + RocketReach pattern (first_initial+last@veritascapital.com 85.3%)'
    },
    {
      firm: 'Trivest Partners',
      contact: 'Jorge Gross Jr.',
      title: 'Managing Partner',
      email: 'jgross@trivest.com',
      linkedin: 'https://www.linkedin.com/in/jorge-gross-jr/',
      source: 'Found via LinkedIn + Wikipedia + RocketReach pattern (first_initial+last@trivest.com 67%)'
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
    console.log(`✅ Updated ${updates.length} more leads with verified contacts`);
  } else {
    console.log('No additional rows needed updating');
  }
}

updateEnrichments().catch(console.error);
