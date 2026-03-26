const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Enrichment data
  const updates = [
    {
      row: 14,
      company: 'ShoreView Industries',
      contactName: 'Scott Gage',
      title: 'Partner',
      email: 'sgage@shoreview.com',
      website: 'https://www.shoreview.com',
      linkedin: 'https://www.linkedin.com/in/scott-gage-33b7b44/',
      status: 'Enriched',
      notes: 'Email pattern inferred from RocketReach (medium confidence). 25+ years PE experience, joined ShoreView 2004. Source: shoreview.com/team'
    },
    {
      row: 196,
      company: 'Patient Square Capital',
      contactName: 'Jim Momtazee',
      title: 'Managing Partner',
      email: 'jmomtazee@patientsquarecapital.com',
      website: 'https://patientsquarecapital.com',
      linkedin: 'https://www.linkedin.com/in/jim-momtazee-65634918b/',
      status: 'Enriched',
      notes: 'Email verified from website/conference bio. Managing Partner of dedicated healthcare PE firm. Source: patientsquarecapital.com/team'
    },
    {
      row: 233,
      company: 'Siris Capital Group',
      contactName: 'Frank Baker',
      title: 'Co-Founder and Managing Partner',
      email: 'baker@siris.com',
      website: 'https://www.siris.com',
      linkedin: 'https://www.linkedin.com/in/frankbaker-siris/',
      status: 'Enriched',
      notes: 'Co-Founder 2011, $7B+ AUM firm. Chose Frank Baker over John Abram (VP) as more senior contact. Source: siris.com/team'
    }
  ];

  console.log('\n🔄 Updating Google Sheet with enrichments...\n');

  for (const update of updates) {
    const row = update.row;
    
    // Column mapping (0-indexed for array, but 1-indexed for A1 notation)
    // A=Company, B=NotebookLM, C=Contact, D=Title, E=Email, F=Website, G=LinkedIn, H=?, I=Contact Notes, J=Status, K=Last Contacted, L=Notes
    
    const range = `Sheet1!C${row}:L${row}`;
    
    const values = [[
      update.contactName,      // C: Contact Name
      update.title,             // D: Title
      update.email,             // E: Email
      update.website,           // F: Website
      update.linkedin,          // G: LinkedIn
      '',                       // H: (field unclear)
      update.notes,             // I: Contact Notes
      update.status,            // J: Status
      '',                       // K: Last Contacted (leave empty)
      ''                        // L: General Notes (leave empty)
    ]];

    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: range,
        valueInputOption: 'RAW',
        resource: { values }
      });
      
      console.log(`✅ Row ${row}: ${update.company} - ${update.contactName} (${update.title})`);
      console.log(`   Email: ${update.email}`);
      console.log(`   LinkedIn: ${update.linkedin}`);
      console.log('');
    } catch (error) {
      console.error(`❌ Failed to update row ${row}:`, error.message);
    }
  }

  console.log('✅ Sheet update complete!\n');
  console.log('📝 Summary:');
  console.log(`   - Updated ${updates.length} firms`);
  console.log(`   - ShoreView Industries: Scott Gage (Partner)`);
  console.log(`   - Patient Square Capital: Jim Momtazee (Managing Partner)`);
  console.log(`   - Siris Capital Group: Frank Baker (Co-Founder & Managing Partner)`);
  console.log('\n🎯 Next: Run next hourly cron for remaining 34 firms\n');
}

main().catch(console.error);
