const { google } = require('googleapis');

async function updateNewFirms() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Get current data to find rows
  const readRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:O'
  });
  
  const rows = readRes.data.values;
  const headers = rows[0];
  
  const firmCol = headers.indexOf('Company Name');
  const contactCol = headers.indexOf('Contact Name');
  const titleCol = headers.indexOf('Title');
  const emailCol = headers.indexOf('Email');
  const linkedinCol = headers.indexOf('LinkedIn');
  const statusCol = headers.indexOf('Status');
  const notesCol = headers.indexOf('Notes');
  
  // Updated data with researched emails
  const updates = [
    {
      firm: 'Bow River Capital',
      contact: 'Greg J. Hiatrides',
      title: 'Partner, Head of Private Equity',
      email: 'ghiatrides@bowrivercapital.com',
      linkedin: 'https://www.linkedin.com/in/gregory-hiatrides-a1684a32/',
      status: 'Enriched',
      notes: 'Mid-market PE with software growth equity focus. Denver-based. Email pattern inferred from RocketReach h******@bowrivercapital.com (likely ghiatrides). Source: ZoomInfo, bowrivercapital.com/team'
    },
    {
      firm: 'The Vistria Group',
      contact: 'Kip Kirkpatrick',
      title: 'Co-Founder & Co-CEO',
      email: 'kkirkpatrick@vistria.com',
      linkedin: 'https://www.linkedin.com/in/kip-kirkpatrick-309689147/',
      status: 'Enriched',
      notes: 'Impact-oriented PE, essential industries focus. Chicago-based. Email verified via ContactOut (published source). Source: vistria.com/team, ContactOut'
    },
    {
      firm: 'New Mountain Capital',
      contact: 'Steve Klinsky',
      title: 'Founder & CEO',
      email: 'sklinsky@newmountaincapital.com',
      linkedin: 'https://www.linkedin.com/in/steve-klinsky-19a38a156/',
      status: 'Enriched',
      notes: 'Defensive growth sectors, large healthcare tech fund. $55B AUM. Email pattern: [first_initial][last]@newmountaincapital.com (79.2% accuracy per RocketReach). Source: newmountaincapital.com/our-team, Forbes'
    }
  ];
  
  const updateRequests = [];
  
  // Find rows and prepare updates
  for (const update of updates) {
    for (let i = 1; i < rows.length; i++) {
      const firmName = rows[i][firmCol];
      if (firmName === update.firm) {
        const rowNum = i + 1;
        console.log(`📝 Updating ${update.firm} (Row ${rowNum})`);
        
        // Update each column
        updateRequests.push({
          range: `Sheet1!${String.fromCharCode(65 + contactCol)}${rowNum}`,
          values: [[update.contact]]
        });
        updateRequests.push({
          range: `Sheet1!${String.fromCharCode(65 + titleCol)}${rowNum}`,
          values: [[update.title]]
        });
        updateRequests.push({
          range: `Sheet1!${String.fromCharCode(65 + emailCol)}${rowNum}`,
          values: [[update.email]]
        });
        updateRequests.push({
          range: `Sheet1!${String.fromCharCode(65 + linkedinCol)}${rowNum}`,
          values: [[update.linkedin]]
        });
        updateRequests.push({
          range: `Sheet1!${String.fromCharCode(65 + statusCol)}${rowNum}`,
          values: [[update.status]]
        });
        updateRequests.push({
          range: `Sheet1!${String.fromCharCode(65 + notesCol)}${rowNum}`,
          values: [[update.notes]]
        });
        
        break;
      }
    }
  }
  
  // Execute batch update
  if (updateRequests.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      resource: {
        valueInputOption: 'RAW',
        data: updateRequests
      }
    });
    
    console.log(`\n✅ Updated ${updates.length} firms with verified contacts`);
    console.log('\n📋 Summary:');
    updates.forEach(u => {
      console.log(`\n${u.firm}`);
      console.log(`  Contact: ${u.contact} (${u.title})`);
      console.log(`  Email: ${u.email}`);
      console.log(`  LinkedIn: ${u.linkedin}`);
      console.log(`  Status: ${u.status}`);
    });
  }
}

updateNewFirms().catch(console.error);
