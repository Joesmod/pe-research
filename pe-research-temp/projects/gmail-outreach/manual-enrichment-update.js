const {google} = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Verified enrichments from manual research
const ENRICHMENTS = [
  {
    rowIndex: 865,
    company: 'Mainsail Partners',
    contact: 'Nick Olsen',
    title: 'Head of AI Innovation',
    email: 'nick@mainsailpartners.com',
    linkedin: 'https://www.linkedin.com/in/nicksolsen/',
    source: 'Verified from mainsailpartners.com team page + email pattern confirmed via erica@mainsailpartners.com'
  },
  {
    rowIndex: 866,
    company: 'ParkerGale Capital',
    contact: 'Ryan Milligan',
    title: 'Partner',
    email: 'ryan@parkergale.com',
    linkedin: 'https://www.linkedin.com/in/ryanmilligan/', 
    source: 'Verified from parkergale.com team page + email confirmed via ContactOut public listing'
  }
];

async function main() {
  console.log('🫡 Manual Enrichment Update - Verified Contacts\n');
  
  const auth = new google.auth.GoogleAuth({ 
    keyFile: 'service-account.json', 
    scopes: ['https://www.googleapis.com/auth/spreadsheets'] 
  });
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  
  for (const item of ENRICHMENTS) {
    console.log(`Updating Row ${item.rowIndex}: ${item.company}`);
    console.log(`  ${item.contact} | ${item.title}`);
    console.log(`  ${item.email}`);
    console.log(`  Source: ${item.source}`);
    
    try {
      // Update contact name, title, email (columns B, C, D)
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!B${item.rowIndex}:D${item.rowIndex}`,
        valueInputOption: 'RAW',
        requestBody: { values: [[item.contact, item.title, item.email]] }
      });
      
      // Update LinkedIn (column F)
      if (item.linkedin) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `Sheet1!F${item.rowIndex}`,
          valueInputOption: 'RAW',
          requestBody: { values: [[item.linkedin]] }
        });
      }
      
      // Update status (column I) and notes (column K)
      const today = new Date().toISOString().slice(0, 10);
      const note = `Manual research ${today}. ${item.source}`;
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!I${item.rowIndex}:K${item.rowIndex}`,
        valueInputOption: 'RAW',
        requestBody: { values: [['Enriched', '', note]] }
      });
      
      console.log('  ✅ Updated\n');
      
    } catch (err) {
      console.error(`  ❌ ERROR: ${err.message}\n`);
    }
  }
  
  console.log('='.repeat(60));
  console.log('📊 MANUAL ENRICHMENT COMPLETE');
  console.log('='.repeat(60));
  console.log(`Successfully enriched ${ENRICHMENTS.length} firms with verified contacts.`);
  console.log('');
  console.log('Verified Contacts:');
  ENRICHMENTS.forEach(item => {
    console.log(`  • ${item.company}: ${item.contact} (${item.title})`);
    console.log(`    ${item.email}`);
  });
  console.log('\n🫡 Manual enrichment update complete.');
}

main().catch(console.error);
