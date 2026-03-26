/**
 * Add 5 New Mid-Market PE Firms - Manual Research Results
 * March 16, 2026 8:45 PM
 * Apollo API credits exhausted - added via web research
 */

const { google } = require('googleapis');
const path = require('path');

const CRM_SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

const NEW_FIRMS = [
  {
    name: 'Excellere Partners',
    website: 'https://excellere.com',
    contact: 'Brad Cornell',
    title: 'Managing Partner',
    linkedin: '',
    focus: 'Healthcare services, $2.5B AUM',
    note: 'Contact found via web research (excellere.com/team). Email pending verification.',
  },
  {
    name: 'Cressey & Company',
    website: 'https://www.cresseyco.com',
    contact: 'Bryan Cressey',
    title: 'Managing Partner',
    linkedin: '',
    focus: 'Healthcare services, $3B AUM',
    note: 'Contact found via web research (cresseyco.com/team). Email pending verification.',
  },
  {
    name: 'NewSpring Capital',
    website: 'https://newspringcapital.com',
    contact: 'Michael DiPiano',
    title: 'Managing General Partner',
    linkedin: '',
    focus: 'Tech-enabled services, $2B AUM',
    note: 'Contact found via web research. Co-founder. Email pending verification.',
  },
  {
    name: 'Pamlico Capital',
    website: 'https://www.pamlicocapital.com',
    contact: '',
    title: '',
    linkedin: '',
    focus: 'Business services, $1B AUM',
    note: 'Firm identified. Contact research needed (website team page unavailable).',
  },
  {
    name: 'Charlesbank Capital Partners',
    website: 'https://www.charlesbank.com',
    contact: 'Sandor Hau',
    title: 'Managing Partner, President Credit',
    linkedin: '',
    focus: 'Services, tech, $4B fund',
    note: 'Contact found via web research. Email pending verification.',
  },
];

async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function addFirms() {
  const sheets = await getSheets();
  
  console.log(`📝 Adding ${NEW_FIRMS.length} new mid-market PE firms (manual research)\n`);
  
  const newRows = [];
  
  for (const firm of NEW_FIRMS) {
    console.log(`🏢 ${firm.name}`);
    console.log(`  Contact: ${firm.contact || '(pending research)'}`);
    console.log(`  Title: ${firm.title || 'N/A'}`);
    console.log(`  Focus: ${firm.focus}`);
    console.log(`  Note: ${firm.note}`);
    
    const row = [
      firm.name,                            // A: Company Name
      firm.website,                         // B: Website
      firm.contact,                         // C: Contact Name
      firm.title,                           // D: Title
      '',                                   // E: Email (empty - needs verification)
      '',                                   // F
      firm.linkedin,                        // G: LinkedIn
      'Manual Research',                    // H: Status
      `Added 2026-03-16. ${firm.focus}. ${firm.note}`, // I: Notes
      'New',                                // J: Status
      '',                                   // K: Last Contacted
      '',                                   // L: Notes
      firm.website,                         // M: Company Info URL
      '6',                                  // N: Gumbo Score (default mid)
    ];
    
    newRows.push(row);
    console.log(`  ✅ Ready to add\n`);
  }
  
  console.log(`💾 Adding ${newRows.length} firms to Google Sheet...\n`);
  
  await sheets.spreadsheets.values.append({
    spreadsheetId: CRM_SHEET_ID,
    range: 'Sheet1!A:N',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: newRows,
    },
  });
  
  console.log(`✅ Successfully added ${newRows.length} new firms!\n`);
  
  console.log(`📊 SUMMARY`);
  console.log(`  Total firms added: ${newRows.length}`);
  console.log(`  Firms with contact names: ${newRows.filter(r => r[2]).length}`);
  console.log(`  Firms needing contact research: ${newRows.filter(r => !r[2]).length}`);
  console.log(`  Next step: Email verification via Apollo when credits available`);
  
  console.log(`\n📋 Added firms:`);
  newRows.forEach(r => {
    const contact = r[2] ? `${r[2]} (${r[3]})` : '(contact pending)';
    console.log(`  • ${r[0]} | ${contact}`);
  });
  
  return { added: newRows.length };
}

addFirms().catch(err => {
  console.error('FATAL ERROR:', err);
  process.exit(1);
});
