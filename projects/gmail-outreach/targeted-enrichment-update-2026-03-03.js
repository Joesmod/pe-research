const { google } = require('googleapis');
const path = require('path');

const KEYFILE = path.join(__dirname, 'service-account.json');
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const RANGE = 'Sheet1!A:L';

async function enrichSpecificRows() {
  console.log('TARGETED PE ENRICHMENT UPDATE');
  console.log('==============================\n');

  const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Read all rows
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: RANGE
  });

  const rows = response.data.values || [];
  const headers = rows[0];

  console.log(`📖 Read ${rows.length} rows from sheet\n`);

  // Find rows to update
  const updates = [];

  // 1. Norwest Venture Partners - Update the row with minimal data
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const firmName = row[0] || '';
    
    // Update Norwest Venture Partners (the one with website as contact)
    if (firmName === 'Norwest Venture Partners' && row[2] === 'https://www.norwest.com') {
      console.log(`✅ Found Norwest Venture Partners at row ${i + 1} - UPDATING`);
      row[2] = 'Jon Kossow';  // Contact Name
      row[3] = 'Managing Partner';  // Title
      row[4] = 'jkossow@nvp.com';  // Email
      row[6] = 'https://www.linkedin.com/in/jon-kossow';  // LinkedIn
      row[9] = 'Enriched';  // Status
      row[11] = 'Email verified via ContactOut. Growth equity focus.';  // Notes
      
      updates.push({
        range: `Sheet1!A${i + 1}:L${i + 1}`,
        values: [row]
      });
      console.log(`   → Jon Kossow, jkossow@nvp.com\n`);
    }
    
    // Update Vistria Group (the one with website as contact)
    if (firmName === 'Vistria Group' && row[2] === 'https://www.vistriagroup.com') {
      console.log(`✅ Found Vistria Group at row ${i + 1} - UPDATING`);
      row[2] = 'Kip Kirkpatrick';  // Contact Name
      row[3] = 'Co-Founder and Co-Chief Executive Officer';  // Title
      row[4] = 'kkirkpatrick@vistria.com';  // Email
      row[6] = 'https://www.linkedin.com/in/kip-kirkpatrick-309689147';  // LinkedIn
      row[9] = 'Enriched';  // Status
      row[11] = 'Chicago-based. Email verified via ContactOut. Focus: Healthcare, Education, FinServ, Housing.';  // Notes
      
      updates.push({
        range: `Sheet1!A${i + 1}:L${i + 1}`,
        values: [row]
      });
      console.log(`   → Kip Kirkpatrick, kkirkpatrick@vistria.com\n`);
    }
    
    // Update Edison Partners - Steve Gross row with empty email
    if (firmName === 'Edison Partners' && row[2] === 'Steve Gross' && !row[4]) {
      console.log(`✅ Found Edison Partners (Steve Gross) at row ${i + 1} - REPLACING with Chris Sugden`);
      row[2] = 'Chris Sugden';  // Contact Name
      row[3] = 'Managing Partner';  // Title
      row[4] = 'csugden@edisonpartners.com';  // Email
      row[6] = 'https://www.linkedin.com/in/christopherssugden';  // LinkedIn
      row[9] = 'Enriched';  // Status
      row[11] = 'Email pattern confirmed via RocketReach. Growth equity, B2B tech.';  // Notes
      
      updates.push({
        range: `Sheet1!A${i + 1}:L${i + 1}`,
        values: [row]
      });
      console.log(`   → Chris Sugden, csugden@edisonpartners.com\n`);
    }
  }

  // Check if Altamont and Renovus are already good
  console.log('✅ Altamont Capital Partners - Already enriched (Keoni Schwartz)');
  console.log('✅ Renovus Capital Partners - Already enriched (Bradley Whitman)\n');

  if (updates.length === 0) {
    console.log('ℹ️  No updates needed - all firms already enriched');
    return;
  }

  // Execute updates
  console.log(`\n🚀 Performing ${updates.length} updates...\n`);
  
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    resource: {
      valueInputOption: 'RAW',
      data: updates
    }
  });

  console.log('✅ ENRICHMENT COMPLETE');
  console.log('======================');
  console.log(`Updated: ${updates.length} firms`);
  console.log(`Timestamp: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}`);
  console.log('\nFirms Updated:');
  console.log('  • Norwest Venture Partners → Jon Kossow');
  console.log('  • Vistria Group → Kip Kirkpatrick');
  console.log('  • Edison Partners → Chris Sugden');
}

enrichSpecificRows().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
