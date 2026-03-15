const { google } = require('googleapis');

async function updateEnrichments() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Read current sheet
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:I'
  });
  
  const rows = response.data.values;
  const updates = [];
  let enrichedCount = 0;
  
  // Define enrichments
  const enrichments = {
    'Cambridge Capital': {
      name: 'Benjamin Gordon',
      title: 'Managing Partner',
      email: 'benjamin@cambridgecapital.com',
      linkedin: 'https://www.linkedin.com/in/bengordon18',
      source: 'cambridgecapital.com/team + RocketReach [first]@domain 80.8%'
    },
    'Edgewater Capital Partners': {
      name: 'Chris Childres',
      title: 'Managing Partner',
      email: 'cchildres@edgewatercapital.com',
      linkedin: 'https://www.edgewatercapital.com/team/',
      source: 'edgewatercapital.com/team + RocketReach FLast@domain 89.9%'
    },
    'Council Capital': {
      name: 'Grant Jackson',
      title: 'Managing Partner',
      email: 'gjackson@councilcapital.com',
      linkedin: 'https://www.councilcapital.com/team/',
      source: 'councilcapital.com/team + RocketReach FLast@domain 91.8%'
    },
    'The Riverside Company': {
      name: 'Stewart Kohl',
      title: 'Co-CEO',
      email: 'skohl@riversidecompany.com',
      linkedin: 'https://www.riversidecompany.com/',
      source: 'RocketReach FLast@riversidecompany.com 94.9%'
    },
    'Gryphon Investors': {
      name: 'R. David Andrews',
      title: 'Founder & Co-CEO',
      email: 'dandrews@gryphoninvestors.com',
      linkedin: 'https://www.gryphon-inv.com/team/',
      source: 'gryphon-inv.com/team + RocketReach [last]@gryphoninvestors.com 89.7%'
    },
    'Genstar Capital': {
      name: 'Jean-Pierre Conte',
      title: 'Chairman and Managing Partner',
      email: 'jconte@gencap.com',
      linkedin: 'https://www.linkedin.com/in/jean-pierre-conte-014503170',
      source: 'RocketReach FLast@gencap.com 94.9%'
    }
  };
  
  // Find and prepare updates
  rows.forEach((row, index) => {
    const rowNumber = index + 1;
    const firmName = row[0] || '';
    
    for (const [key, data] of Object.entries(enrichments)) {
      if (firmName.includes(key)) {
        updates.push({
          range: `Sheet1!C${rowNumber}:F${rowNumber}`,
          values: [[
            data.name,
            data.title,
            data.email,
            data.linkedin
          ]]
        });
        updates.push({
          range: `Sheet1!H${rowNumber}`,
          values: [['Enriched']]
        });
        updates.push({
          range: `Sheet1!I${rowNumber}`,
          values: [[`Source: ${data.source}`]]
        });
        enrichedCount++;
        console.log(`✓ ${key} → ${data.name} (${data.title})`);
        break;
      }
    }
  });
  
  // Batch update
  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        data: updates,
        valueInputOption: 'RAW'
      }
    });
    console.log(`\n✅ Updated ${enrichedCount} firms with enriched data`);
  } else {
    console.log('⚠️ No matching firms found to update');
  }
}

updateEnrichments().catch(console.error);
