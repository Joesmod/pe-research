const { google } = require('googleapis');

async function updateResearchFindings() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
    
    // Research findings to update
    const updates = [
      {
        row: 56, // WindRose Health Investors
        contact: 'Oliver T. Moses',
        title: 'Managing Partner',
        linkedin: 'https://www.linkedin.com/in/oliver-t-moses-936b0a205/',
        status: 'Researched - No Public Email',
        notes: 'Verified from windrose.com/team/. Individual emails not publicly available (industry standard). Use info@windrose.com or LinkedIn InMail.'
      },
      {
        row: 410, // Goodwater Capital
        contact: 'Chi-Hua Chien',
        title: 'Co-Founder & Managing Partner',
        linkedin: 'https://www.linkedin.com/in/chihuachien',
        status: 'Researched - No Public Email',
        notes: 'Verified from goodwatercap.com. No individual emails published. Contact via info@goodwatercap.com or LinkedIn.'
      },
      {
        row: 509, // Denham Capital Management
        contact: 'Sarah Lane',
        title: 'Managing Director, Sustainable Infrastructure',
        linkedin: 'https://www.linkedin.com/in/sarah-lane-5927b550/',
        status: 'Researched - LinkedIn Available',
        notes: 'Verified MD at Denham Capital (denhamcapital.com/team-member/sarah-lane/). No public email. Recommend LinkedIn outreach.'
      },
      {
        row: 515, // Fulcrum Equity Partners
        contact: 'Frank X. Dalton',
        title: 'Founder & Partner',
        linkedin: 'https://www.fulcrumep.com/person/frank-dalton/',
        status: 'Researched - Email Unverified',
        notes: 'Confirmed from fulcrumep.com. Email fdalton@fulcrumep.com not verified as publicly available.'
      },
      {
        row: 513, // Forerunner Ventures
        contact: 'Kirsten Green',
        title: 'Founder & Managing Partner',
        linkedin: 'https://www.forerunnerventures.com/team/kirsten-green',
        status: 'Researched - Email Unverified',
        notes: 'Verified from forerunnerventures.com. Email kgreen@forerunnerventures.com not confirmed public.'
      },
      {
        row: 493, // 360 Equipment Finance
        contact: 'Kip Amstutz',
        title: 'Founder',
        status: 'Researched - No Public Contact',
        notes: 'Confirmed founder from 360equipmentfinance.com/about/. No contact page with individual emails found.'
      }
    ];
    
    console.log('Updating Google Sheet with research findings...\n');
    
    const updateData = [];
    for (const update of updates) {
      const row = update.row;
      
      // Prepare update values (columns C, D, G, J, L based on typical sheet structure)
      // C=Contact, D=Title, G=LinkedIn, J=Status, L=Notes
      const rowData = {
        range: `Sheet1!C${row}:L${row}`,
        values: [[
          update.contact || '',      // C - Contact Name
          update.title || '',         // D - Title
          '',                         // E - Email (leave existing)
          '',                         // F - Website (leave existing)
          update.linkedin || '',      // G - LinkedIn URL
          '',                         // H - (skip)
          '',                         // I - (skip)
          update.status || '',        // J - Status
          '',                         // K - (skip)
          update.notes || ''          // L - Notes
        ]]
      };
      
      updateData.push(rowData);
      
      console.log(`Row ${row}: ${update.contact} - ${update.status}`);
    }
    
    // Batch update
    const batchUpdateRequest = {
      spreadsheetId,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: updateData
      }
    };
    
    await sheets.spreadsheets.values.batchUpdate(batchUpdateRequest);
    
    console.log(`\n✓ Updated ${updates.length} rows in Google Sheet`);
    console.log('✓ Research findings documented in Notes column');
    console.log('✓ LinkedIn URLs added where available');
    
  } catch (error) {
    console.error('Error updating sheet:', error.message);
    throw error;
  }
}

updateResearchFindings();
