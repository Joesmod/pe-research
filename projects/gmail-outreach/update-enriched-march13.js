const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = './service-account.json';

const updates = [
  // Harry Gruner - JMI Equity (Row 240 - duplicate at 1010)
  {
    row: 240,
    email: 'hgruner@jmi.com',
    status: 'Enriched',
    notes: 'Apollo verified email: hgruner@jmi.com. Co-Founder & Managing Partner. 2026-03-13 enrichment.'
  },
  {
    row: 1010,
    email: 'hgruner@jmi.com',
    status: 'Enriched',
    notes: 'DUPLICATE of row 240. Apollo verified email: hgruner@jmi.com. Co-Founder & Managing Partner. 2026-03-13 enrichment.'
  },
  
  // Vincenzo La Ruffa - Aquiline (Row 561)
  {
    row: 561,
    email: 'vlr@aquiline.com',
    status: 'Enriched',
    notes: 'Apollo verified email: vlr@aquiline.com (replacing generic contact@aquiline.com). Managing Partner, $7B+ AUM. 2026-03-13 enrichment.'
  },
  
  // Suzanne Yoon - Kinzie Capital Partners (Row 1058)
  {
    row: 1058,
    email: 'syoon@chelsealighting.com',
    status: 'Enriched',
    notes: 'Apollo verified email: syoon@chelsealighting.com (via Apollo portfolio company domain). Founder & Managing Partner. Ph: 312-809-2490. Chicago lower middle market PE. 2026-03-13 enrichment.'
  },
  
  // Blue Star Innovation Partners (Row 11) - No verified email found
  {
    row: 11,
    email: '',
    status: 'Enriched - No Public Email',
    notes: 'Hurley Doddy, Founder & CEO. LinkedIn: https://www.linkedin.com/in/hurleydoddy. No verified public email found (Apollo returned null). Growth equity firm focused on software and tech. 2026-03-13 enrichment attempt.'
  },
  
  // Huron Capital (Row 25) - INCORRECT DATA
  {
    row: 25,
    contact: 'Jim Mahoney',
    title: 'Managing Partner',
    email: '',
    linkedin: 'http://www.linkedin.com/in/jamessmahoney',
    status: 'Enriched - Data Correction Needed',
    notes: 'CORRECTION: Fabio Sattin is NOT at Huron Capital (he is at Private Equity Partners in Italy). Correct contact: Jim Mahoney, Managing Partner (promoted Feb 2021). No public email found. Detroit, founded 1999, $1B+ AUM. 2026-03-13 enrichment.'
  },
  
  // Backstroke (Row 909) - NOT PE
  {
    row: 909,
    status: 'Dead - Not PE/VC',
    notes: 'NOT a private equity or venture capital firm. Previously noted Steve had proposal call (~$70K/mo) that did not pan out. 2026-03-13 verification.'
  },
  
  // Satso (Row 910) - NOT PE
  {
    row: 910,
    status: 'Dead - Not PE/VC',
    notes: 'NOT a private equity or venture capital firm. Pro-sobriety SaaS needing CTO/dev. Steve followed up, did not pan out. 2026-03-13 verification.'
  },
  
  // Rehab Medical (Row 1061) - NOT PE
  {
    row: 1061,
    status: 'Dead - Not Investment Firm',
    notes: 'Medical equipment/mobility solutions provider (wheelchairs, mobility devices). Kevin Gearhart (President). NOT an investment firm. Indianapolis-based. 2026-03-13 verification.'
  }
];

async function main() {
  console.log('=== UPDATING GOOGLE SHEET - MARCH 13 12:37 AM ===\n');

  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Prepare batch update
  const batchData = [];

  for (const update of updates) {
    const rowIdx = update.row;
    
    // Email update (column E = index 4)
    if (update.email !== undefined) {
      batchData.push({
        range: `Sheet1!E${rowIdx}`,
        values: [[update.email]]
      });
    }
    
    // Contact update (column C = index 2)
    if (update.contact) {
      batchData.push({
        range: `Sheet1!C${rowIdx}`,
        values: [[update.contact]]
      });
    }
    
    // Title update (column D = index 3)
    if (update.title) {
      batchData.push({
        range: `Sheet1!D${rowIdx}`,
        values: [[update.title]]
      });
    }
    
    // LinkedIn update (column G = index 6)
    if (update.linkedin) {
      batchData.push({
        range: `Sheet1!G${rowIdx}`,
        values: [[update.linkedin]]
      });
    }
    
    // Status update (column J = index 9)
    if (update.status) {
      batchData.push({
        range: `Sheet1!J${rowIdx}`,
        values: [[update.status]]
      });
    }
    
    // Notes update (column L = index 11)
    if (update.notes) {
      batchData.push({
        range: `Sheet1!L${rowIdx}`,
        values: [[update.notes]]
      });
    }
  }

  console.log(`Preparing ${batchData.length} cell updates...\n`);

  // Execute batch update
  try {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: batchData
      }
    });

    console.log('✓ Successfully updated sheet!\n');
    
    console.log('SUMMARY:');
    console.log('✓ 3 verified emails found and added');
    console.log('✓ 1 generic email replaced with direct contact');
    console.log('✓ 3 firms marked as Dead/Not PE');
    console.log('✓ 2 firms marked as "No Public Email" (need alternate approach)');
    console.log('✓ 1 data correction made (Huron Capital contact)');
    
    // Save summary
    const summary = {
      timestamp: new Date().toISOString(),
      verified: [
        'Harry Gruner (JMI Equity): hgruner@jmi.com',
        'Vincenzo La Ruffa (Aquiline): vlr@aquiline.com',
        'Suzanne Yoon (Kinzie Capital Partners): syoon@chelsealighting.com'
      ],
      noEmail: [
        'Hurley Doddy (Blue Star Innovation Partners)',
        'Jim Mahoney (Huron Capital)'
      ],
      markedDead: [
        'Backstroke (Not PE)',
        'Satso (Not PE)',
        'Rehab Medical (Not Investment Firm)'
      ],
      corrections: [
        'Huron Capital: Changed contact from Fabio Sattin to Jim Mahoney'
      ]
    };
    
    fs.writeFileSync(
      './enrichment-summary-march13-1237am.json',
      JSON.stringify(summary, null, 2)
    );
    
    console.log('\n✓ Summary saved to enrichment-summary-march13-1237am.json');
    
  } catch (error) {
    console.error('Error updating sheet:', error.message);
    throw error;
  }
}

main().catch(console.error);
