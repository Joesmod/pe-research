const {google} = require('googleapis');
const key = require('./service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const enrichedData = [
  {
    row: 2, // Row index (1-based, accounting for header)
    company: 'AUA Private Equity Partners',
    contactName: 'Andy Unanue',
    title: 'Founder & Managing Partner',
    email: '', // No verified published email found
    linkedin: 'https://www.linkedin.com/company/aua-private-equity-partners',
    status: 'Needs Email',
    notes: 'Leadership confirmed on official website. Email pattern not found in published sources.'
  },
  {
    row: 7, // Main Post Partners
    company: 'Main Post Partners',
    contactName: 'Sean Honey',
    title: 'Managing Partner',
    email: '', // Pattern found (s***@mainpostpartners.com) but not fully verified
    linkedin: 'https://www.linkedin.com/in/sean-honey-mainpost',
    status: 'Needs Email',
    notes: 'Managing Partner confirmed. Email pattern incomplete from RocketReach.'
  },
  {
    row: 10, // Huron Capital Partners
    company: 'Huron Capital Partners',
    contactName: 'Jim Mahoney',
    title: 'Managing Partner',
    email: '', // Pattern jma*******@huroncapital.com found but incomplete
    linkedin: 'https://www.linkedin.com/in/jamessmahoney/',
    status: 'Needs Email',
    notes: 'Managing Partner confirmed on official site. Incomplete email pattern from contact databases.'
  },
  {
    row: 11, // Bow River Capital
    company: 'Bow River Capital',
    contactName: 'Blair Richardson',
    title: 'Founder & CEO',
    email: '', // Pattern r******@bowrivercapital.com incomplete
    linkedin: 'https://www.linkedin.com/in/blair-richardson-a4755613/',
    status: 'Needs Email',
    notes: 'CEO confirmed. Email pattern incomplete from RocketReach.'
  },
  {
    row: 12, // Sverica Capital
    company: 'Sverica Capital Management',
    contactName: 'Dave Finley',
    title: 'Managing Partner',
    email: '', // Not verified from published source
    linkedin: 'https://www.linkedin.com/company/sverica-capital-management',
    status: 'Needs Email',
    notes: 'Managing Partner confirmed on official site. Email not found in published sources.'
  },
  {
    row: 15, // Resilience Capital Partners
    company: 'Resilience Capital Partners',
    contactName: 'Bassem Mansour',
    title: 'Co-CEO & Co-Founder',
    email: '', // Pattern b******@resiliencecapital.com incomplete
    linkedin: 'https://www.linkedin.com/in/bassemmansour/',
    status: 'Needs Email',
    notes: 'Co-CEO confirmed on official website. Email pattern incomplete from RocketReach.'
  },
  {
    row: 18, // Marlin Equity Partners
    company: 'Marlin Equity Partners',
    contactName: 'Alex Beregovsky',
    title: 'Managing Director',
    email: '', // Pattern a***@marlinequity.com incomplete
    linkedin: 'https://www.linkedin.com/in/alex-beregovsky',
    status: 'Needs Email',
    notes: 'Managing Director confirmed. Email pattern incomplete from ZoomInfo.'
  }
];

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({version: 'v4', auth: await auth.getClient()});

  // First, read the current sheet to understand structure
  const readRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:I',
  });

  console.log('Current sheet has', readRes.data.values.length, 'rows');
  
  // Prepare batch update
  const updates = [];
  
  for (const item of enrichedData) {
    // Update Contact Name (column C, index 2)
    if (item.contactName) {
      updates.push({
        range: `Sheet1!C${item.row}`,
        values: [[item.contactName]]
      });
    }
    
    // Update Title (column D, index 3)
    if (item.title) {
      updates.push({
        range: `Sheet1!D${item.row}`,
        values: [[item.title]]
      });
    }
    
    // Update Email (column E, index 4) - leave blank if not verified
    if (item.email) {
      updates.push({
        range: `Sheet1!E${item.row}`,
        values: [[item.email]]
      });
    }
    
    // Update LinkedIn (column G, index 6)
    if (item.linkedin) {
      updates.push({
        range: `Sheet1!G${item.row}`,
        values: [[item.linkedin]]
      });
    }
    
    // Update Status (column H, index 7)
    if (item.status) {
      updates.push({
        range: `Sheet1!H${item.row}`,
        values: [[item.status]]
      });
    }
    
    // Update Notes (column I, index 8)
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
    
    console.log(`Updated ${updates.length} cells across ${enrichedData.length} firms`);
    console.log('\nEnriched firms:');
    enrichedData.forEach(item => {
      console.log(`- ${item.company}: ${item.contactName} (${item.title})`);
    });
  }
}

updateSheet().catch(console.error);
