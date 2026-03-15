const {google} = require('googleapis');
const key = require('./service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const enrichedData = [
  {
    row: 1230,
    company: 'Bow River Capital',
    website: 'https://www.bowrivercapital.com',
    contactName: 'Blair Richardson',
    title: 'Founder & CEO',
    email: '', // Pattern r******@bowrivercapital.com - not fully verified
    linkedin: 'https://www.linkedin.com/in/blair-richardson-a4755613/',
    status: 'Needs Email',
    notes: 'CEO confirmed on official site. Email pattern from RocketReach (r******@bowrivercapital.com). Denver-based, ~$2.5B+ AUM.'
  },
  {
    row: 1231,
    company: 'Sverica Capital Management',
    website: 'https://sverica.com',
    contactName: 'Dave Finley',
    title: 'Managing Partner',
    email: '', // Not verified from published source
    linkedin: 'https://www.linkedin.com/company/sverica-capital-management',
    status: 'Needs Email',
    notes: 'Managing Partner confirmed on official website. Recently promoted Michael Dougherty to Partner. Boston-based.'
  },
  {
    row: 1232,
    company: 'Resilience Capital Partners',
    website: 'https://resiliencecapital.com',
    contactName: 'Bassem Mansour',
    title: 'Co-CEO & Co-Founder',
    email: '', // Pattern b******@resiliencecapital.com - not fully verified
    linkedin: 'https://www.linkedin.com/in/bassemmansour/',
    status: 'Needs Email',
    notes: 'Co-CEO confirmed on official website (co-founded with Steve Rosen in 2001). Email pattern from RocketReach (b******@resiliencecapital.com). Cleveland/Denver.'
  },
  {
    row: 1233,
    company: 'Marlin Equity Partners',
    website: 'https://www.marlinequity.com',
    contactName: 'Alex Beregovsky',
    title: 'Managing Director',
    email: '', // Pattern a***@marlinequity.com - not fully verified
    linkedin: 'https://www.linkedin.com/in/alex-beregovsky',
    status: 'Needs Email',
    notes: 'Managing Director confirmed. Email pattern from ZoomInfo (a***@marlinequity.com). Los Angeles, $8B+ AUM.'
  }
];

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({version: 'v4', auth: await auth.getClient()});

  // Prepare batch update
  const updates = [];
  
  for (const item of enrichedData) {
    // Column mapping: A=Company, B=Website, C=Contact, D=Title, E=Email, F=?, G=LinkedIn, H=Status, I=Notes
    
    // Update Website (column B)
    if (item.website) {
      updates.push({
        range: `Sheet1!B${item.row}`,
        values: [[item.website]]
      });
    }
    
    // Update Contact Name (column C)
    if (item.contactName) {
      updates.push({
        range: `Sheet1!C${item.row}`,
        values: [[item.contactName]]
      });
    }
    
    // Update Title (column D)
    if (item.title) {
      updates.push({
        range: `Sheet1!D${item.row}`,
        values: [[item.title]]
      });
    }
    
    // Update Email (column E) - leave blank if not verified
    updates.push({
      range: `Sheet1!E${item.row}`,
      values: [[item.email || '']]
    });
    
    // Update LinkedIn (column G)
    if (item.linkedin) {
      updates.push({
        range: `Sheet1!G${item.row}`,
        values: [[item.linkedin]]
      });
    }
    
    // Update Status (column H)
    if (item.status) {
      updates.push({
        range: `Sheet1!H${item.row}`,
        values: [[item.status]]
      });
    }
    
    // Update Notes (column I)
    if (item.notes) {
      updates.push({
        range: `Sheet1!I${item.row}`,
        values: [[item.notes]]
      });
    }
  }

  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      resource: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
    
    console.log(`\n✅ Updated ${updates.length} cells across ${enrichedData.length} firms`);
    console.log('\n📊 Enriched firms:');
    enrichedData.forEach(item => {
      console.log(`  • ${item.company}: ${item.contactName} (${item.title})`);
    });
    console.log('\n⚠️  All firms marked "Needs Email" - email patterns found but not from official published sources.');
    console.log('    Will need Apollo API or direct outreach to verify emails.\n');
  }
}

updateSheet().catch(console.error);
