const { google } = require('googleapis');
const key = require('../gmail-outreach/service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function appendNew() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });

  // New mid-market PE firms ($500M-$5B AUM, services-heavy)
  const newFirms = [
    [
      'Saw Mill Capital',
      'https://www.sawmillcapital.com',
      'Jeff Kaplan',
      'Partner',
      '',
      '',
      'https://www.linkedin.com/company/saw-mill-capital',
      '',
      'Mid-market PE, ~$2B AUM, focuses on business services, healthcare, consumer. Founded 2006. (Added 2026-03-28 cron)',
      'Needs Research'
    ],
    [
      'Milestone Partners',
      'https://www.milestonepartners.com',
      'Bret Scholtes',
      'Managing Partner',
      '',
      '',
      'https://www.linkedin.com/company/milestone-partners',
      '',
      'Mid-market PE, $1.8B AUM, business services & healthcare. Founded 2004. (Added 2026-03-28 cron)',
      'Needs Research'
    ],
    [
      'Norwest Equity Partners',
      'https://www.norwep.com',
      'John Scully',
      'Managing Partner',
      '',
      '',
      'https://www.linkedin.com/company/norwest-equity-partners',
      '',
      'Mid-market PE, $3.5B+ AUM, consumer, healthcare, services. Part of Norwest since 1961. (Added 2026-03-28 cron)',
      'Needs Research'
    ]
  ];

  console.log('Appending new PE firms to sheet...');
  
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:J',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: newFirms
    }
  });

  console.log(`✅ Successfully added ${newFirms.length} new PE firms!`);
}

appendNew().catch(console.error);
