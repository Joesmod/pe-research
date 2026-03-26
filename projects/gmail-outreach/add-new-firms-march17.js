/**
 * Add new mid-market PE firms to the CRM sheet
 * Focus: $500M-$5B AUM, services-heavy
 */

const { google } = require('googleapis');
const path = require('path');

const CRM_SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

// New firms to add with VERIFIED, publicly available contact info
const NEW_FIRMS = [
  {
    company: 'Sterling Investment Partners',
    website: 'https://www.sterlinglp.com',
    contact: 'David H. Kahn',
    title: 'Senior Managing Director, Business Development',
    email: 'kahn@sterlinglp.com',
    linkedin: 'https://www.linkedin.com/company/sterling-investment-partners',
    status: 'Enriched',
    notes: 'Mid-market PE, $1.6B+ AUM (Fund V closed Nov 2025). Focus: Business Services & Distribution. 30+ years operating. Equity per transaction: $100-450M. Contact email verified from official sterlinglp.com press releases (March 2026). Alternative contacts: Amy Weisman (weisman@sterlinglp.com), Susan Staub (staub@sterlinglp.com). Based in Greenwich, CT.',
    infoUrl: 'https://www.sterlinglp.com/team',
    gumboScore: 8,
  },
];

async function addFirms() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read current sheet to get column structure
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: CRM_SHEET_ID,
    range: 'Sheet1!A1:N1',
  });
  
  const headers = res.data.values[0] || [];
  console.log(`📋 Headers: ${headers.slice(0, 14).join(' | ')}\n`);
  
  // Get current row count
  const allRes = await sheets.spreadsheets.values.get({
    spreadsheetId: CRM_SHEET_ID,
    range: 'Sheet1!A:A',
  });
  
  const currentRowCount = allRes.data.values.length;
  console.log(`📊 Current row count: ${currentRowCount}\n`);
  
  // Prepare rows to append
  const rowsToAdd = [];
  
  for (const firm of NEW_FIRMS) {
    console.log(`✅ Adding: ${firm.company}`);
    console.log(`  Contact: ${firm.contact} (${firm.title})`);
    console.log(`  Email: ${firm.email}`);
    console.log(`  Website: ${firm.website}\n`);
    
    // Map to columns: Company Name, Website, Contact, Title, Email, ???, LinkedIn, Status, Notes, ???, ???, ???, Info URL, Gumbo Score
    // Based on inspect: A=Company, B=Website?, C=Contact, D=Title, E=Email, F=???, G=LinkedIn, H=Status, I=Notes, J=Status?, K=LastContacted?, L=Notes?, M=InfoURL, N=GumboScore
    
    const row = [
      firm.company,           // A: Company Name
      firm.website,           // B: NotebookLM / Website
      firm.contact,           // C: Contact Name
      firm.title,             // D: Title
      firm.email,             // E: Email
      '',                     // F: (unknown)
      firm.linkedin,          // G: LinkedIn
      firm.status,            // H: Status
      firm.notes,             // I: Notes
      'New',                  // J: Status (second)
      '',                     // K: Last Contacted
      'Added by hourly cron March 17, 2026 11PM', // L: Notes (second)
      firm.infoUrl,           // M: Company Info URL
      firm.gumboScore,        // N: Gumbo Score
    ];
    
    rowsToAdd.push(row);
  }
  
  // Append rows
  await sheets.spreadsheets.values.append({
    spreadsheetId: CRM_SHEET_ID,
    range: 'Sheet1!A:N',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: rowsToAdd,
    },
  });
  
  console.log(`\n✅ Successfully added ${rowsToAdd.length} new firm(s) to the sheet!`);
  console.log(`New rows: ${currentRowCount + 1} - ${currentRowCount + rowsToAdd.length}`);
}

addFirms().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
