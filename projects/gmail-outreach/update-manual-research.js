const { google } = require('googleapis');

const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  return google.sheets({ version: 'v4', auth });
}

async function updateManualResearch() {
  console.log('📝 Updating Manual Research Results - March 11, 2026 (4:39 PM)\n');
  
  const sheets = await getSheets();
  
  // Manual research findings
  const updates = [
    {
      row: 161, // Thomas H. Lee Partners
      contact: 'Communications Team',
      title: 'Communications',
      email: 'communications@thl.com',
      linkedin: 'N/A',
      status: 'Generic Contact Only',
      notes: 'Manual web research 2026-03-11: Found generic email (communications@thl.com) from official website. No verified individual decision-maker emails found despite checking LinkedIn profiles of Managing Directors (Mark Bean, Ganesh Rao, Josh Bresler, Nicole Wong, Scott Sperling, Gregory White).'
    },
    {
      row: 220, // WindPoint Partners
      contact: 'Admin Team',
      title: 'Administration',
      email: 'admins@wppartners.com',
      linkedin: 'N/A',
      status: 'Generic Contact Only',
      notes: 'Manual web research 2026-03-11: Found generic emails (info@wppartners.com, admins@wppartners.com) from Crunchbase. Identified Managing Directors on LinkedIn (Nathan Brown, Alex Washington, Rich Kracum, Paul Peterson, Joe Lawler) but no verified individual emails.'
    },
    {
      row: 223, // Harvest Partners (SCF)
      contact: 'April Blackmon Meyer',
      title: 'Marketing and Investor Relations',
      email: 'ameyer@harvestpartners.com',
      linkedin: 'N/A',
      status: 'Enriched',
      notes: 'Manual web research 2026-03-11: Verified email from Business Wire press release (2018-01-09). Phone: 212-379-9135. Source: https://www.businesswire.com/news/home/20180109005673/'
    },
    {
      row: 234, // The Jordan Company (TJC)
      contact: 'General Inquiry',
      title: 'N/A',
      email: 'N/A',
      linkedin: 'https://www.linkedin.com/company/the-jordan-company',
      status: 'Needs Manual Research',
      notes: 'Manual web research 2026-03-11: Found LinkedIn profiles of partners (Ian Arons - Co-Chair Investment Committee) but no verified individual emails. Official website (tjclp.com) only lists phone numbers. Requires LinkedIn outreach or phone contact.'
    },
    {
      row: 307, // Argonaut Private Equity
      contact: 'Kelby Hagar',
      title: 'President',
      email: 'N/A',
      linkedin: 'N/A',
      status: 'Needs Manual Research',
      notes: 'Manual web research 2026-03-11: Identified President (Kelby Hagar) and VPs (Eric Weeldreyer, Brandon Lenhart) via RocketReach, but no verified published emails. Website (argonautpe.com) has no contact info. Phone: (918) 392-9650. Tulsa, OK. Requires LinkedIn or phone outreach.'
    }
  ];
  
  console.log(`📊 Updating ${updates.length} rows in sheet...\n`);
  
  for (const update of updates) {
    const { row, contact, title, email, linkedin, status, notes } = update;
    
    console.log(`━━━ Row ${row}: ${contact || 'N/A'} ━━━`);
    console.log(`  Contact: ${contact}`);
    console.log(`  Title: ${title}`);
    console.log(`  Email: ${email}`);
    console.log(`  Status: ${status}`);
    
    // Update contact info (columns C-G: Contact Name, Title, Email, Phone, LinkedIn)
    const contactRange = `Sheet1!C${row}:G${row}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: contactRange,
      valueInputOption: 'RAW',
      resource: {
        values: [[contact, title, email, '', linkedin]]
      }
    });
    
    // Update status and notes (columns J, L)
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      resource: {
        data: [
          { range: `Sheet1!J${row}`, values: [[status]] },
          { range: `Sheet1!L${row}`, values: [[notes]] }
        ],
        valueInputOption: 'RAW'
      }
    });
    
    console.log(`  ✅ Updated\n`);
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 MANUAL RESEARCH SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const enriched = updates.filter(u => u.status === 'Enriched');
  const genericOnly = updates.filter(u => u.status === 'Generic Contact Only');
  const needsMore = updates.filter(u => u.status === 'Needs Manual Research');
  
  console.log(`✅ Fully Enriched (verified individual): ${enriched.length}`);
  if (enriched.length > 0) {
    enriched.forEach(u => {
      console.log(`  • Row ${u.row}: ${u.contact} (${u.email})`);
    });
  }
  console.log('');
  
  console.log(`⚠️ Generic Contact Only: ${genericOnly.length}`);
  if (genericOnly.length > 0) {
    genericOnly.forEach(u => {
      console.log(`  • Row ${u.row}: ${u.email}`);
    });
  }
  console.log('');
  
  console.log(`📝 Still Needs LinkedIn/Phone Outreach: ${needsMore.length}`);
  if (needsMore.length > 0) {
    needsMore.forEach(u => {
      const firm = u.contact;
      console.log(`  • Row ${u.row}: ${firm}`);
    });
  }
  console.log('');
  
  console.log('✅ Sheet updated successfully!');
  console.log(`📅 ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}`);
}

updateManualResearch().catch(err => {
  console.error('\n❌ ERROR:', err.message);
  console.error(err.stack);
  process.exit(1);
});
