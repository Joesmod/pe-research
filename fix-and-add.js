const { google } = require('googleapis');
const key = require('../gmail-outreach/service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function fixAndAdd() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });

  // Fix Row 18: Gryphon Investors (email in wrong column)
  console.log('Fixing Row 18: Gryphon Investors...');
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!D18:E18',
    valueInputOption: 'RAW',
    requestBody: {
      values: [['Founder & Co-CEO', 'andrews@gryphoninvestors.com']]
    }
  });
  console.log('✓ Fixed Gryphon Investors');

  // Fix Row 115: Alpine Investors (email in wrong column)
  console.log('Fixing Row 115: Alpine Investors...');
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!D115:E115',
    valueInputOption: 'RAW',
    requestBody: {
      values: [['Founding Partner & President', 'mstrauch@alpineinvestors.com']]
    }
  });
  console.log('✓ Fixed Alpine Investors');

  // Find the last row with data
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:A',
  });
  
  const lastRow = res.data.values.length + 1;
  console.log(`\nAdding new firms starting at row ${lastRow}...`);

  // Add new mid-market PE firms ($500M-$5B AUM, services-heavy)
  const newFirms = [
    {
      company: 'Saw Mill Capital',
      website: 'https://www.sawmillcapital.com',
      contact: 'Jeff Kaplan',
      title: 'Partner',
      email: '',
      linkedin: 'https://www.linkedin.com/company/saw-mill-capital',
      status: 'Needs Research',
      notes: 'Mid-market PE, ~$2B AUM, focuses on business services, healthcare, consumer. Founded 2006. (Added 2026-03-28 cron)'
    },
    {
      company: 'Milestone Partners',
      website: 'https://www.milestonepartners.com',
      contact: 'Bret Scholtes',
      title: 'Managing Partner',
      email: '',
      linkedin: 'https://www.linkedin.com/company/milestone-partners',
      status: 'Needs Research',
      notes: 'Mid-market PE, $1.8B AUM, business services & healthcare. Founded 2004. (Added 2026-03-28 cron)'
    },
    {
      company: 'Norwest Equity Partners',
      website: 'https://www.norwep.com',
      contact: 'John Scully',
      title: 'Managing Partner',
      email: '',
      linkedin: 'https://www.linkedin.com/company/norwest-equity-partners',
      status: 'Needs Research',
      notes: 'Mid-market PE, $3.5B+ AUM, consumer, healthcare, services. Part of Norwest since 1961. (Added 2026-03-28 cron)'
    },
    {
      company: 'Quad-C Management',
      website: 'https://www.quad-c.com',
      contact: 'Adam Giannini',
      title: 'Partner',
      email: '',
      linkedin: 'https://www.linkedin.com/company/quad-c-management',
      status: 'Needs Research',
      notes: 'Mid-market PE, $4B+ AUM, business & distribution services, niche manufacturing. Founded 1989. (Added 2026-03-28 cron)'
    },
    {
      company: 'MidOcean Partners',
      website: 'https://www.midoceanpartners.com',
      contact: 'Ted Virtue',
      title: 'Chief Executive Officer and Managing Partner',
      email: '',
      linkedin: 'https://www.linkedin.com/company/midocean-partners',
      status: 'Needs Research',
      notes: 'Mid-market PE, $9B+ AUM, consumer, business services, specialty distribution. Founded 2003. (Added 2026-03-28 cron)'
    }
  ];

  for (let i = 0; i < newFirms.length; i++) {
    const firm = newFirms[i];
    const rowNum = lastRow + i;
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Sheet1!A${rowNum}:J${rowNum}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          firm.company,
          firm.website,
          firm.contact,
          firm.title,
          firm.email,
          '',
          firm.linkedin,
          '',
          firm.notes,
          firm.status
        ]]
      }
    });
    
    console.log(`✓ Added ${firm.company}`);
  }

  console.log(`\n✅ Fixed 2 existing rows and added ${newFirms.length} new PE firms!`);
}

fixAndAdd().catch(console.error);
