const { google } = require('googleapis');

async function updateLeads() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Leads to update (row numbers are 1-indexed in the sheet)
  const updates = [
    {
      row: 1198, // Rockwood Equity - Brett Keith
      company: 'Rockwood Equity',
      contactName: 'Brett Keith',
      title: 'Managing Partner',
      email: '', // No verified email from official sources
      website: 'https://www.rockwoodequity.com',
      linkedin: 'https://www.linkedin.com/in/brett-keith-rockwood',
      status: 'Researched - No Public Email',
      notes: 'LinkedIn profile found. Official website lists phone (212) 218-8284 but no published email. RocketReach suggests b***@rockwoodequity.com but not from official source.'
    },
    {
      row: 1199, // Linden Capital Partners - Anthony B. Davis
      company: 'Linden Capital Partners',
      contactName: 'Anthony B. Davis',
      title: 'Co-Founder, President & Managing Partner',
      email: '', // No verified email from official sources
      website: 'https://www.linden.com',
      linkedin: 'https://www.linkedin.com/in/anthony-b-davis',
      status: 'Researched - No Public Email',
      notes: 'LinkedIn profile found. Official website lists general info@linden.com, phone 312-506-5600, but no individual email published. RocketReach suggests t***@lindenllc.com but not from official source.'
    },
    {
      row: 1200, // Lightyear Capital - Mark Vassallo
      company: 'Lightyear Capital',
      contactName: 'Mark Vassallo',
      title: 'Managing Partner',
      email: '', // No verified email from official sources
      website: 'https://www.lycap.com',
      linkedin: 'https://www.linkedin.com/in/mark-vassallo-24213a242',
      status: 'Researched - No Public Email',
      notes: 'LinkedIn profile found. Official website lists compliance@lycap.com but no individual emails published. RocketReach suggests m***@lycap.com but not from official source.'
    },
    {
      row: 1201, // One Equity Partners - J.B. Cherry
      company: 'One Equity Partners',
      contactName: 'J.B. Cherry',
      title: 'Partner',
      email: '', // No verified email from official sources
      website: 'https://www.oneequity.com',
      linkedin: 'https://www.linkedin.com/in/jb-cherry-8358864',
      status: 'Researched - No Public Email',
      notes: 'LinkedIn profile found. Official website lists press contact only. RocketReach/ContactOut suggest j***@oneequity.com and james.b.cherry@oneequity.com but not from official sources.'
    }
  ];
  
  // Build the update requests
  const updateRequests = [];
  
  for (const update of updates) {
    // Update columns: A=Company (col 0), C=Contact Name (col 2), D=Title (col 3), E=Email (col 4), 
    // F=Website (col 5), G=LinkedIn (col 6), H=Status (col 7), I=Notes (col 8)
    updateRequests.push({
      range: `Sheet1!C${update.row}:I${update.row}`,
      values: [[
        update.contactName,
        update.title,
        update.email,
        update.website,
        update.linkedin,
        update.status,
        update.notes
      ]]
    });
  }
  
  if (updateRequests.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: updateRequests
      }
    });
    
    console.log(`Updated ${updateRequests.length} leads successfully.`);
    console.log('');
    console.log('Summary:');
    for (const update of updates) {
      console.log(`- ${update.company}: ${update.contactName} (${update.title})`);
      console.log(`  LinkedIn: ${update.linkedin}`);
      console.log(`  Status: ${update.status}`);
      console.log('');
    }
  }
}

updateLeads().catch(console.error);
