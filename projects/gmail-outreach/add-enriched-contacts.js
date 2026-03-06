const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const credentials = JSON.parse(fs.readFileSync('service-account.json', 'utf8'));

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

async function updateEnrichedContacts() {
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  
  // Sunstone Partners - Row 680
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!C680:J680',
    valueInputOption: 'RAW',
    resource: {
      values: [[
        'Gus Alberelli',                                    // C: Contact Name
        'Co-Founder & Managing Partner',                   // D: Title
        'galberelli@sunstonepartners.com',                 // E: Email (inferred)
        'https://sunstonepartners.com',                    // F: Website
        'https://www.linkedin.com/in/gus-alberelli/',      // G: LinkedIn (inferred)
        'B2B Software, Tech Services',                     // H: Sectors
        'Email inferred from domain pattern. General: LPRelations@sunstonepartners.com. Board: Avertium, EverService, Knowtion, UserTesting, Vcheck.', // I: Notes
        'Enriched'                                         // J: Status
      ]]
    }
  });
  console.log('✅ Updated Sunstone Partners (Row 680)');
  
  // TAU Investment Management - Row 683
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!C683:J683',
    valueInputOption: 'RAW',
    resource: {
      values: [[
        'Oliver Niedermaier',                              // C: Contact Name
        'Founder, Chairman & CEO',                         // D: Title
        'oliver.niedermaier@tau-investment.com',           // E: Email (inferred)
        'https://tau-investment.com',                      // F: Website
        'https://www.linkedin.com/in/oliver-niedermaier-26733a232/', // G: LinkedIn
        'Apparel, Supply Chain, Manufacturing',            // H: Sectors
        'Email inferred from standard pattern. General: info@tau-investment.com. Phone: (646) 797-4700. NYC office: 110 East 25th St, 11th Floor.', // I: Notes
        'Enriched'                                         // J: Status
      ]]
    }
  });
  console.log('✅ Updated TAU Investment Management (Row 683)');
  
  console.log('\n🎉 Successfully enriched 2 PE firms!');
}

updateEnrichedContacts().catch(console.error);
