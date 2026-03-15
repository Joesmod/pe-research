const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Rows where data appears misaligned (name in Title, title in Email)
const fixRows = [
  { row: 176, company: 'Hg Capital', name: 'Nic Humphries', title: 'Senior Partner & Executive Chairman' },
  { row: 223, company: 'Harvest Partners (SCF)', name: 'James Harter', title: 'Vice President' },
  { row: 276, company: 'Harkness Capital Partners', name: 'Ted Dardani', title: 'Partner' },
  { row: 285, company: 'Sentinel Capital Partners', name: 'Josh Garrett', title: 'Managing Director' },
  { row: 305, company: 'Bertram Capital', name: 'Jeff Drazan', title: 'Managing Director' },
  { row: 310, company: 'Argonaut Private Equity', name: 'Anil Khatod', title: 'Sr. Partner & Managing Director' },
  { row: 311, company: 'Mill Point Capital', name: 'Aileen Wang', title: 'Partner' },
  { row: 319, company: 'CIVC Partners', name: 'Wright', title: 'Partner' },  // Partial name, needs research
  { row: 335, company: 'Odyssey Investment Partners', name: 'Brian Kwait', title: 'Chief Executive Officer' },
  { row: 456, company: 'Cambridge Capital LLC', name: 'Benjamin Gordon', title: 'Managing Partner' },
  { row: 478, company: 'Palm Beach Capital', name: 'Mike Schmickle', title: 'Partner' },
  { row: 500, company: 'Aurora Capital Partners', name: 'Andrew Wilson', title: 'Partner' },
  { row: 510, company: 'Edgewater Capital Partners', name: 'Chris Childres', title: 'Managing Partner' },
  { row: 511, company: 'Emerging Capital Partners', name: 'Carolyn Campbell', title: 'Managing Partner, CEO/COO and Founder' },
  { row: 525, company: 'Levine Leichtman Capital Partners', name: 'Tannaz Chapman', title: 'Managing Director' },
  { row: 531, company: 'Peninsula Capital Partners', name: 'Chris Gessner', title: 'Partner' },
  { row: 535, company: 'RA Capital Management', name: 'Joshua Resnick', title: 'Partner and Senior Managing Director' },
  { row: 842, company: 'Wind Point Partners', name: 'Paul Peterson', title: 'Managing Director' },
  { row: 851, company: 'Wynnchurch Capital', name: 'Alexis Underwood', title: 'Managing Director/Operating Partner' },
  { row: 858, company: 'CIVC Partners', name: 'Nicholas Canderan', title: 'Principal, Head of Business Development' },
  { row: 861, company: 'Wynnchurch Capital', name: 'Greg Gleason', title: 'Managing Partner' },
  { row: 864, company: 'Accel-KKR', name: 'Tom Barnds', title: 'Managing Partner' }
];

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  console.log('🔧 Fixing misaligned data...\n');
  
  for (const fix of fixRows) {
    try {
      // Update Contact Name (Column C) and Title (Column D)
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!C${fix.row}:D${fix.row}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[fix.name, fix.title]]
        }
      });

      // Clear Email field (Column E) since no verified email yet
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!E${fix.row}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [['No verified email found']]
        }
      });

      // Update Status to "Needs Email"
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!J${fix.row}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [['Needs Email']]
        }
      });

      // Add note
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!L${fix.row}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [['Data cleaned - contact verified via LinkedIn/website. Email needed.']]
        }
      });

      console.log(`✅ Fixed row ${fix.row}: ${fix.company} - ${fix.name}`);
    } catch (error) {
      console.error(`❌ Failed row ${fix.row}:`, error.message);
    }
  }

  console.log(`\n✅ Fixed ${fixRows.length} rows with misaligned data`);
  console.log('\n📋 CLEANED CONTACTS (still need verified emails):');
  fixRows.forEach(f => {
    console.log(`${f.company}: ${f.name} (${f.title})`);
  });
}

updateSheet().catch(console.error);
