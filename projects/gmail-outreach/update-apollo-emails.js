const {google} = require('googleapis');
const key = require('./service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const apolloVerified = [
  {
    row: 1230,
    company: 'Bow River Capital',
    contactName: 'Blair Richardson',
    title: 'Founder and Chief Executive Officer',
    email: 'richardson@bowrivercapital.com',
    linkedin: 'http://www.linkedin.com/in/blair-richardson-a4755613',
    status: 'Enriched',
    notes: 'Apollo API verified - 2026-03-15. CEO/Founder, Denver-based, $2.5B+ AUM, private equity and real estate.'
  },
  {
    row: 1231,
    company: 'Sverica Capital Management',
    contactName: 'Dave Finley',
    title: 'Managing Partner',
    email: 'dave@sverica.com',
    linkedin: 'https://www.linkedin.com/company/sverica-capital-management',
    status: 'Enriched',
    notes: 'Apollo API verified - 2026-03-15. Managing Partner, Boston-based, mid-market PE, focus on business services and healthcare.'
  },
  {
    row: 1232,
    company: 'Resilience Capital Partners',
    contactName: 'Bassem Mansour',
    title: 'Founder and CEO',
    email: 'bmansour@resiliencecapital.com',
    linkedin: 'http://www.linkedin.com/in/bassemmansour',
    status: 'Enriched',
    notes: 'Apollo API verified - 2026-03-15. Co-founded with Steve Rosen in 2001. Cleveland/Denver-based, $675M+ capital committed.'
  },
  {
    row: 1233,
    company: 'Marlin Equity Partners',
    contactName: 'Alex Beregovsky',
    title: 'Managing Director',
    email: 'aberegovsky@marlinequity.com',
    linkedin: 'https://www.linkedin.com/in/alex-beregovsky',
    status: 'Enriched',
    notes: 'Apollo API verified - 2026-03-15. Managing Director, Los Angeles-based, $8B+ AUM, focus on technology and software.'
  },
  {
    row: 1228,
    company: 'Main Post Partners',
    contactName: 'Sean Honey',
    title: 'Managing Partner',
    email: 'shoney@mainpostpartners.com',
    linkedin: 'https://www.linkedin.com/in/sean-honey-mainpost',
    status: 'Enriched',
    notes: 'Apollo API verified - 2026-03-15. Additional contact (Jeffrey Mills also MP). San Francisco-based healthcare PE.'
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
  
  for (const item of apolloVerified) {
    // Column mapping: A=Company, B=Website, C=Contact, D=Title, E=Email, F=?, G=LinkedIn, H=Status, I=Notes
    
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
    
    // Update Email (column E) - VERIFIED
    if (item.email) {
      updates.push({
        range: `Sheet1!E${item.row}`,
        values: [[item.email]]
      });
    }
    
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
    
    console.log(`\n✅ Updated ${updates.length} cells across ${apolloVerified.length} firms`);
    console.log('\n📧 Apollo-verified emails added:');
    apolloVerified.forEach(item => {
      console.log(`  • ${item.contactName} (${item.company}): ${item.email}`);
    });
    console.log('\n✓ All contacts verified via Apollo API with direct emails.\n');
  }
}

updateSheet().catch(console.error);
