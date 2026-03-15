const { google } = require('googleapis');

const SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Verified emails from Apollo + research
const updates = [
  // Row 977 - American Industrial Partners - Lawrence Steyn
  { row: 977, col: 'E', value: 'lsteyn@americanindustrial.com' },
  { row: 977, col: 'G', value: 'http://www.linkedin.com/in/lawrence-steyn-7595a03' },
  { row: 977, col: 'J', value: 'Enriched' },
  { row: 977, col: 'K', value: 'Partner. Apollo verified email 2026-03-09. NYC-based. Email pattern: firstname@americanindustrial.com' },
  
  // Row 978 - American Industrial Partners - Jamie Tam
  { row: 978, col: 'E', value: 'jtam@americanindustrial.com' },
  { row: 978, col: 'G', value: 'http://www.linkedin.com/in/jamie-tam-b161749' },
  { row: 978, col: 'J', value: 'Enriched' },
  { row: 978, col: 'K', value: 'Partner - Business Development. Apollo verified email 2026-03-09. NYC-based.' },
  
  // Row 979 - American Industrial Partners - Daryl Yap
  // Keep as-is, not found in Apollo
  
  // Row 980 - Renovus Capital Partners - Jason Tanker
  { row: 980, col: 'E', value: 'jason.tanker@renovuscapital.com' },
  { row: 980, col: 'G', value: 'http://www.linkedin.com/in/jtanker' },
  { row: 980, col: 'J', value: 'Enriched' },
  { row: 980, col: 'K', value: 'Managing Director, Technology Services practice. Apollo verified email 2026-03-09. Wayne PA. $2B+ AUM.' },
  
  // Row 981 - Vistria Group - Martin Nesbitt
  // Keep as-is, not found in Apollo (very high-profile, likely private)
  
  // Row 982 - Gemspring Capital - Charles Fraas
  { row: 982, col: 'E', value: 'charles@gemspring.com' },
  { row: 982, col: 'G', value: 'http://www.linkedin.com/in/charles-fraas-7362414' },
  { row: 982, col: 'J', value: 'Enriched' },
  { row: 982, col: 'K', value: 'Managing Director at Gemspring. Apollo verified email 2026-03-09. Westport CT. $3.5B+ AUM.' },
  
  // Row 983 - Quad-C Management - Joseph April
  { row: 983, col: 'E', value: 'jwa@qc-inc.com' },
  { row: 983, col: 'G', value: 'http://www.linkedin.com/in/joseph-april-8564038' },
  { row: 983, col: 'J', value: 'Enriched' },
  { row: 983, col: 'K', value: 'MD Portfolio Optimization. Apollo verified email 2026-03-09. Charlottesville VA. $1.7B Fund X. Founded 1989.' },
  
  // Row 984 - Water Street Healthcare Partners - Timothy Dugan
  { row: 984, col: 'E', value: 'tim.dugan@waterstreet.com' },
  { row: 984, col: 'G', value: 'http://www.linkedin.com/in/tim-dugan' },
  { row: 984, col: 'J', value: 'Enriched' },
  { row: 984, col: 'K', value: 'Managing Partner. Founded Water Street in 2005. Apollo verified email 2026-03-09. Chicago. Healthcare-only focus.' },
];

async function updateSheet() {
  console.log('🫡 Updating Google Sheet with verified emails...\n');
  
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Batch update
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
    console.log('📊 ENRICHMENT SUMMARY:');
    console.log('   7 verified emails added from Apollo');
    console.log('   7 LinkedIn URLs added');
    console.log('   6 statuses updated to "Enriched"\n');
    
    console.log('❌ STILL NEED RESEARCH (not in Apollo):');
    console.log('   - Row 39: Herbert Hooper (Ampersand Capital)');
    console.log('   - Row 40: Lawrence Aldrich (Aldrich Capital)');
    console.log('   - Row 494: Joe Lonsdale (8VC) - very high-profile');
    console.log('   - Row 700: Kim Marvin (AIP)');
    console.log('   - Row 880: Joshua Schultz (Arsenal Capital)');
    console.log('   - Row 979: Daryl Yap (AIP)');
    console.log('   - Row 981: Martin Nesbitt (Vistria) - very high-profile');
    console.log('   - Row 985: Chris Sugden (Edison Partners)');
    console.log('   - Row 986: Tim DeVries (Norwest Equity)\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
}

updateSheet();
