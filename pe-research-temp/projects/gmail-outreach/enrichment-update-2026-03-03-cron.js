const { google } = require('googleapis');

async function updateEnrichment() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Enrichment updates - only verified sources
  const updates = [
    {
      row: 888,
      company: 'Corridor Capital',
      contact: 'Craig Enenstein',
      title: 'Founder & CEO',
      email: 'craig@corridorcap.com',
      linkedin: 'https://www.linkedin.com/in/craig-enenstein/',
      notes: 'Email verified from official Corridor Capital PDF',
      status: 'Enriched'
    },
    {
      row: 614,
      company: 'GTMfund',
      contact: 'Max Altschuler',
      title: 'Founder & General Partner',
      email: '',
      linkedin: 'https://www.linkedin.com/in/maxaltschuler/',
      notes: 'Contact identified, email pattern found (max@gtmfund.com) but not verified from official source',
      status: 'Researched - Needs Verification'
    },
    {
      row: 615,
      company: 'Hark Capital',
      contact: 'Doug Cruikshank',
      title: 'Managing Partner & Founder',
      email: '',
      linkedin: 'https://www.linkedin.com/in/doug-cruikshank-hark/',
      notes: 'Contact verified, email pattern at harkcap.com found but not from official source',
      status: 'Researched - Needs Verification'
    },
    {
      row: 851,
      company: 'Wynnchurch Capital',
      contact: 'John Hatherly',
      title: 'Managing Partner',
      email: '',
      linkedin: 'https://www.linkedin.com/in/john-hatherly-4b772112/',
      notes: 'Contact verified via wynnchurch.com team page, no public email found',
      status: 'Researched - No Email'
    },
    {
      row: 852,
      company: 'McNally Capital',
      contact: 'Ravi P. Shah',
      title: 'Partner',
      email: '',
      linkedin: 'https://www.linkedin.com/in/ravishahchicago/',
      notes: 'Contact verified, email pattern at mcnallycapital.com found but not from official source',
      status: 'Researched - Needs Verification'
    },
    {
      row: 853,
      company: 'Peak Rock Capital',
      contact: 'Anthony DiSimone',
      title: 'Chief Executive Officer',
      email: '',
      linkedin: 'https://www.linkedin.com/pub/dir/Anthony/Disimone',
      notes: 'Contact verified via peakrockcapital.com team page, no public email found',
      status: 'Researched - No Email'
    },
    {
      row: 862,
      company: 'The Riverside Company',
      contact: 'Eric Feldman',
      title: 'Chief Information Officer',
      email: '',
      linkedin: 'https://www.linkedin.com/in/eric-feldman-67a09a1/',
      notes: 'Contact verified via riversidecompany.com, no direct email published',
      status: 'Researched - No Email'
    },
    {
      row: 863,
      company: 'Mainsail Partners',
      contact: 'Dan Blake',
      title: 'CTO-in-Residence',
      email: '',
      linkedin: '',
      notes: 'Contact verified on mainsailpartners.com team page, email format first@mainsailpartners.com found but individual email not confirmed',
      status: 'Researched - Needs Verification'
    },
    {
      row: 864,
      company: 'Accel-KKR',
      contact: 'Tom Barnds',
      title: 'Co-Managing Partner',
      email: '',
      linkedin: 'https://www.linkedin.com/in/tom-barnds-6083525/',
      notes: 'Contact verified via accel-kkr.com team page, no public email found',
      status: 'Researched - No Email'
    },
    {
      row: 871,
      company: 'ICV Partners',
      contact: 'Willie E. Woods',
      title: 'Managing Partner',
      email: '',
      linkedin: 'https://www.linkedin.com/in/willie-woods-0a102699/',
      notes: 'Contact verified via icvpartners.com, email pattern wwoods@icvpartners.com found but not from official source',
      status: 'Researched - Needs Verification'
    },
    {
      row: 883,
      company: 'Arsenal Capital Partners',
      contact: 'Dimitris Agrafiotis',
      title: 'Director, Digital, Analytics & AI',
      email: '',
      linkedin: 'https://www.linkedin.com/in/dagrafiotis/',
      notes: 'Contact verified via arsenalcapital.com team page, no public email found',
      status: 'Researched - No Email'
    },
    {
      row: 895,
      company: 'Aeonic Partners',
      contact: 'Brad Resnick',
      title: 'Co-Founder & Managing Partner',
      email: '',
      linkedin: 'https://www.linkedin.com/in/brad-resnick-1b75a95/',
      notes: 'Contact verified, no public email found',
      status: 'Researched - No Email'
    }
  ];
  
  console.log(`Updating ${updates.length} rows in sheet...`);
  
  for (const update of updates) {
    const values = [
      [
        update.company,
        update.contact,
        update.title,
        update.email,
        '', // Website
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
  
  console.log('\nEnrichment complete!');
  console.log(`- 1 lead fully enriched with verified email`);
  console.log(`- 11 leads researched with contact info but no verified email`);
}

updateEnrichment().catch(console.error);
