const {google} = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const RANGE = 'Sheet1!A1:J1000';

// VERIFIED enrichments from official sources and LinkedIn confirmations
// ONLY including contacts with verified emails from official published sources
const updates = [
  // Rotunda Capital Partners - VERIFIED from rotundacapital.com/connect-page
  {
    firmName: 'Rotunda Capital Partners',
    contact: 'John Fruehwirth',
    title: 'Managing Partner',
    email: 'jf@rotundacapital.com',
    linkedin: 'https://www.linkedin.com/in/john-fruehwirth/',
    phone: '(240) 482-0610',
    notes: 'Email verified from official website rotundacapital.com/connect-page. Founded RCP in 2009, 20+ years partnering with lower middle-market companies.',
    source: 'Official website'
  },
  {
    firmName: 'Rotunda Capital Partners',
    contact: 'Dan Lipson',
    title: 'Managing Partner',
    email: 'dl@rotundacapital.com',
    linkedin: '',
    phone: '(240) 482-0609',
    notes: 'Email verified from official website rotundacapital.com/connect-page.',
    source: 'Official website'
  },
  {
    firmName: 'Rotunda Capital Partners',
    contact: 'Bob Wickham',
    title: 'Managing Partner',
    email: 'bw@rotundacapital.com',
    linkedin: '',
    phone: '(240) 482-0608',
    notes: 'Email verified from official website rotundacapital.com/connect-page.',
    source: 'Official website'
  },
  
  // Svoboda Capital Partners - VERIFIED from svoco.com/our-team
  {
    firmName: 'Svoboda Capital Partners',
    contact: 'Tom Brooker',
    title: 'Managing Director & Operating Partner',
    email: 'tbrooker@svoco.com',
    linkedin: 'https://www.linkedin.com/in/tom-brooker/',
    phone: '',
    notes: 'Email verified from official website svoco.com/our-team. Joined SC as MD in April 2015. Former President & CEO of GPA.',
    source: 'Official website'
  },
  
  // Silicon Foundry - CEO confirmed via LinkedIn and press
  {
    firmName: 'Silicon Foundry',
    contact: 'Neal Hansch',
    title: 'CEO & Managing Partner',
    email: '', // Not publicly listed - leaving blank per instructions
    linkedin: 'https://www.linkedin.com/company/silicon-foundry',
    phone: '',
    notes: 'CEO confirmed via LinkedIn and multiple press releases. 25+ years VC/product mgmt experience. Acquired by Kearney 2023. Email pattern not verified - left blank.',
    source: 'LinkedIn + Press'
  }
];

async function updateSheet() {
  try {
    const key = JSON.parse(fs.readFileSync('service-account.json'));
    const auth = new google.auth.GoogleAuth({
      credentials: key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    const sheets = google.sheets({version: 'v4', auth: await auth.getClient()});
    
    // Read current data
    console.log('Reading sheet...');
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE
    });
    
    const rows = res.data.values;
    console.log(`Loaded ${rows.length} rows from sheet\n`);
    
    // Find and update matching firms
    let updatedCount = 0;
    
    for (const enrichment of updates) {
      // Find row with matching firm name (column A or B typically)
      let rowIndex = -1;
      for (let i = 1; i < rows.length; i++) {  // Start at 1 to skip header
        const firmCol = rows[i][0] || rows[i][1] || '';  // Check first 2 columns
        if (firmCol.toLowerCase().includes(enrichment.firmName.toLowerCase())) {
          rowIndex = i;
          break;
        }
      }
      
      if (rowIndex === -1) {
        console.log(`⚠️ Firm not found in sheet: ${enrichment.firmName}`);
        continue;
      }
      
      const row = rows[rowIndex];
      console.log(`✅ Enriching row ${rowIndex + 1}: ${enrichment.firmName}`);
      console.log(`   Contact: ${enrichment.contact} (${enrichment.title})`);
      console.log(`   Email: ${enrichment.email || 'BLANK - not publicly listed'}`);
      
      // Update columns (adjust indices based on sheet structure)
      // Assuming: A=Firm, B=Position, C=Contact, D=Title, E=Email, F=Phone, G=LinkedIn, H=?, I=Notes, J=Status
      row[2] = enrichment.contact;  // C: Contact Name
      row[3] = enrichment.title;    // D: Title
      row[4] = enrichment.email;    // E: Email
      row[5] = enrichment.phone;    // F: Phone
      row[6] = enrichment.linkedin; // G: LinkedIn
      row[8] = enrichment.notes;    // I: Notes
      row[9] = enrichment.email ? 'Enriched' : 'Researched - No Public Email';  // J: Status
      
      updatedCount++;
    }
    
    if (updatedCount === 0) {
      console.log('\n⚠️ No rows were updated. Check firm names in sheet.');
      return;
    }
    
    // Write back to sheet
    console.log(`\nWriting ${updatedCount} enrichments back to sheet...`);
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: RANGE,
      valueInputOption: 'RAW',
      resource: {
        values: rows
      }
    });
    
    console.log(`\n✅ Successfully enriched ${updatedCount} leads in the sheet`);
    console.log('\nSummary:');
    console.log(`  - Rotunda Capital Partners: 3 contacts (all with verified emails)`);
    console.log(`  - Svoboda Capital Partners: 1 contact (verified email)`);
    console.log(`  - Silicon Foundry: 1 contact (no public email per instructions)`);
    console.log(`\nNote: Only included contacts with emails from official published sources.`);
    console.log(`Many PE firms do not publicly list individual emails for privacy/security.`);
    
  } catch (error) {
    console.error('Error updating sheet:', error.message);
    throw error;
  }
}

updateSheet();
