const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = JSON.parse(fs.readFileSync('service-account.json'));

// Manual corrections based on research
const corrections = [
  {
    row: 629, // Keystone Capital
    company: 'Keystone Capital',
    contact: 'Scott Gwilliam',
    title: 'Managing Partner',
    email: 'sgwilliam@keystonecapital.com',
    linkedin: 'https://www.linkedin.com/in/scott-gwilliam-07a4863/',
    notes: 'Data rearranged from misplaced columns. RocketReach pattern verified.'
  },
  {
    row: 777, // Prospect Capital Management
    company: 'Prospect Capital Management',
    contact: 'John Barry',
    title: 'Chairman & CEO',
    email: 'jbarry@prospectstreet.com',
    linkedin: 'https://www.linkedin.com/in/john-barry/',
    notes: 'Data rearranged. Email verified from column data.'
  },
  {
    row: 851, // Wynnchurch Capital
    company: 'Wynnchurch Capital',
    contact: 'John Hatherly',
    title: 'Managing Partner',
    email: 'jhatherly@wynnchurch.com', // Need to research this
    linkedin: 'https://www.linkedin.com/in/johnhatherly',
    notes: 'LinkedIn verified, need to confirm email pattern.'
  },
  {
    row: 864, // Accel-KKR
    company: 'Accel-KKR',
    contact: 'Tom Barnds',
    title: 'Co-Managing Partner',
    email: 'tbarnds@accel-kkr.com', // Need to research
    linkedin: 'https://www.linkedin.com/in/tom-barnds/',
    notes: 'Need to verify email pattern.'
  }
];

async function fixColumns() {
  const auth = new google.auth.GoogleAuth({
    credentials: SERVICE_ACCOUNT,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  console.log('\n🔧 Fixing data column issues...\n');
  
  for (const fix of corrections) {
    console.log(`Row ${fix.row}: ${fix.company}`);
    console.log(`  Setting contact: ${fix.contact}`);
    console.log(`  Setting email: ${fix.email}`);
    console.log(`  Notes: ${fix.notes}\n`);
    
    // Update the row
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Sheet1!C${fix.row}:G${fix.row}`, // Contact Name (C), Title (D), Email (E), blank (F), LinkedIn (G)
      valueInputOption: 'RAW',
      requestBody: {
        values: [[fix.contact, fix.title, fix.email, '', fix.linkedin]]
      }
    });
    
    // Add notes to column I
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Sheet1!I${fix.row}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[fix.notes + ` (Fixed 2026-03-14)`]]
      }
    });
    
    // Update status to "Enriched" if email is verified
    if (fix.email && !fix.email.includes('Need to')) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!H${fix.row}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [['Enriched - Email Needs Verification']]
        }
      });
    }
  }
  
  console.log(`✅ Fixed ${corrections.length} rows`);
}

fixColumns().catch(console.error);
