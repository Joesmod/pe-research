const { google } = require('googleapis');

const SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Final batch: verified emails from official published sources
const updates = [
  // Row 985 - Edison Partners - Chris Sugden
  { row: 985, col: 'E', value: 'csugden@edisonpartners.com' },
  { row: 985, col: 'G', value: 'https://www.linkedin.com/in/christopherssugden/' },
  { row: 985, col: 'J', value: 'Enriched' },
  { row: 985, col: 'K', value: 'Managing Partner & Investment Committee Chairman. Email published on official team page 2026-03-09. Princeton/Nashville. 25+ portfolio company director roles, 6 current fintech boards. Growth equity $10-30M revenue companies.' },
  
  // Row 986 - Norwest Equity Partners - Tim DeVries
  { row: 986, col: 'E', value: 'tdevries@nep.com' },
  { row: 986, col: 'G', value: 'https://www.linkedin.com/in/tim-devries' },
  { row: 986, col: 'J', value: 'Enriched' },
  { row: 986, col: 'K', value: 'Managing Partner leading firm strategy. Investment committee member. Email published on official team page 2026-03-09. Minneapolis/West Palm Beach. 60+ years PE history. Focus: business/consumer services, industrials.' },
  
  // Row 979 - American Industrial Partners - Daryl Yap (no email found, but add LinkedIn)
  { row: 979, col: 'G', value: 'https://www.linkedin.com/in/daryl-yap' },
  { row: 979, col: 'J', value: 'Research - Needs Email' },
  { row: 979, col: 'K', value: 'Partner & Co-Head of Business Development. Confirmed on official team page americanindustrial.com/team. NYC-based. Email pattern likely dyap@americanindustrial.com but NOT VERIFIED. 2026-03-09 cron enrichment' },
];

async function updateSheet() {
  console.log('🫡 Final enrichment batch - March 9, 7:36 AM\n');
  
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    
    const updateRequests = updates.map(u => {
      const range = `Sheet1!${u.col}${u.row}`;
      return {
        range,
        values: [[u.value]]
      };
    });
    
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      resource: {
        valueInputOption: 'RAW',
        data: updateRequests
      }
    });
    
    console.log(`✅ Updated ${updates.length} cells in Google Sheet\n`);
    console.log('📊 HOURLY ENRICHMENT COMPLETE - March 9, 7:36 AM');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ ENRICHED (Verified Emails Added):');
    console.log('   • 9 verified emails from official sources');
    console.log('   • 9 LinkedIn URLs added');
    console.log('   • 8 leads marked "Enriched"\n');
    
    console.log('📋 VERIFIED EMAIL SOURCES:');
    console.log('   • Apollo.io API: 7 contacts');
    console.log('   • Official team pages: 2 contacts (Edison, Norwest)\n');
    
    console.log('⚠️  STILL NEED RESEARCH (7 leads):');
    console.log('   • Row 39: Herbert Hooper (Ampersand Capital) - not in Apollo');
    console.log('   • Row 40: Lawrence Aldrich (Aldrich Capital) - not in Apollo');
    console.log('   • Row 494: Joe Lonsdale (8VC) - very high-profile founder');
    console.log('   • Row 700: Kim Marvin (AIP) - not in Apollo');
    console.log('   • Row 880: Joshua Schultz (Arsenal Capital) - recent hire');
    console.log('   • Row 979: Daryl Yap (AIP) - pattern likely but unverified');
    console.log('   • Row 981: Martin Nesbitt (Vistria) - very high-profile co-founder\n');
    
    console.log('💡 NEXT STEPS:');
    console.log('   1. Manual LinkedIn outreach for high-profile contacts');
    console.log('   2. Search for alternative decision-makers at same firms');
    console.log('   3. Monitor for new published contact info');
    console.log('   4. Consider cold outreach to generic emails with referral\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
}

updateSheet();
