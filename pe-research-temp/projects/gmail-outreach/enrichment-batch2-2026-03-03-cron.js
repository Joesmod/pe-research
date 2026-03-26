const { google } = require('googleapis');

async function updateEnrichmentBatch2() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Additional enrichments - batch 2
  const updates = [
    {
      row: 617,
      company: 'HealthQuest Capital',
      contact: 'Garheng Kong',
      title: 'Founder and Managing Partner',
      email: '',
      website: 'https://www.healthquestcapital.com',
      linkedin: 'https://www.linkedin.com/company/healthquest-capital',
      notes: 'Team includes Sam Brasch (Partner), Sharath Reddy. No public email found.',
      status: 'Researched - No Email'
    },
    {
      row: 619,
      company: 'HOF Capital',
      contact: 'Hisham Elhaddad',
      title: 'Co-Founder and Managing Partner',
      email: '',
      website: 'http://www.hofcapital.com',
      linkedin: 'https://www.linkedin.com/company/hof-capital',
      notes: 'Co-founders: Onsi Sawiris, Fady Yacoub. Phone: (646) 503-5030. No public email.',
      status: 'Researched - No Email'
    },
    {
      row: 631,
      company: 'Lead Edge Capital',
      contact: 'Mitchell Green',
      title: 'Founder and Managing Partner',
      email: '',
      website: 'https://leadedge.com',
      linkedin: 'https://www.linkedin.com/company/lead-edge-capital',
      notes: 'Email format first@leadedgecapital.com found but specific email not verified',
      status: 'Researched - Needs Verification'
    },
    {
      row: 802,
      company: 'Thrive Capital',
      contact: 'Joshua Kushner',
      title: 'Founder & Managing Partner',
      email: '',
      website: 'https://www.thrivecap.com',
      linkedin: 'https://www.linkedin.com/in/joshua-kushner-711b45230/',
      notes: 'Email pattern at thrivecap.com found but not from official source',
      status: 'Researched - Needs Verification'
    },
    {
      row: 810,
      company: 'VMG Partners',
      contact: 'Robin Tsai',
      title: 'Managing Partner, Consumer & Technology',
      email: 'tsai@vmgpartners.com',
      website: 'https://www.vmgpartners.com',
      linkedin: 'https://www.vmgpartners.com/team/robin-tsai',
      notes: 'Email verified from official VMG Partners team page',
      status: 'Enriched'
    }
  ];
  
  console.log(`Updating ${updates.length} additional rows in sheet...`);
  
  for (const update of updates) {
    const values = [
      [
        update.company,
        update.contact,
        update.title,
        update.email,
        update.website,
        update.linkedin,
        '', // Date Added
        '', // Last Contact
        update.status,
        '', // Follow Up
        update.notes
      ]
    ];
    
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Sheet1!A${update.row}:K${update.row}`,
        valueInputOption: 'RAW',
        resource: { values }
      });
      console.log(`✓ Updated row ${update.row}: ${update.company} - ${update.contact} (${update.status})`);
    } catch (error) {
      console.error(`✗ Failed to update row ${update.row}:`, error.message);
    }
  }
  
  console.log('\nBatch 2 enrichment complete!');
}

updateEnrichmentBatch2().catch(console.error);
