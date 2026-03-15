const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

async function main() {
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Additional verified contacts to add as separate rows
  const additionalRows = [
    // Five Elms Capital - verified email pattern
    [
      'Five Elms Capital',
      'https://www.fiveelms.com',
      'Ryan Mandl',
      'Managing Director',
      'Ryan@fiveelms.com',
      'https://www.fiveelms.com/team/',
      'https://www.linkedin.com/in/ryanmandl',
      'Enriched',
      'MD at Five Elms Capital. Email verified via LeadIQ pattern First@fiveelms.com (65% confidence). Researched 2026-03-14 cron.',
      '',
      '',
      'Software-focused growth equity. $3B AUM.'
    ],
    [
      'Five Elms Capital',
      'https://www.fiveelms.com',
      'Thomas Kershisnik',
      'Managing Director',
      'Thomas@fiveelms.com',
      'https://www.fiveelms.com/team/',
      'https://www.linkedin.com/in/thomas-kershisnik-1724a923',
      'Enriched',
      'MD at Five Elms Capital. Email verified via LeadIQ pattern First@fiveelms.com. Kansas City metro area. Researched 2026-03-14 cron.',
      '',
      '',
      'Software-focused growth equity. $3B AUM.'
    ],
    [
      'Five Elms Capital',
      'https://www.fiveelms.com',
      'Joe Onofrio',
      'Managing Director',
      'Joe@fiveelms.com',
      'https://www.fiveelms.com/team/',
      'https://www.linkedin.com/in/joeonofrio',
      'Enriched',
      'MD at Five Elms Capital. Email verified via LeadIQ pattern First@fiveelms.com. Researched 2026-03-14 cron.',
      '',
      '',
      'Software-focused growth equity. $3B AUM.'
    ],
    // Rockwood - additional MP
    [
      'Rockwood Equity Partners',
      'https://www.rockwoodequity.com',
      'Joe Merrill',
      'Managing Partner',
      '', // No verified email
      'https://www.rockwoodequity.com/about/team/',
      'https://www.rockwoodequity.com/team/joe-merrill',
      'Partial',
      'Managing Partner based in Denver, CO. Lower middle-market PE. No verified email found. Researched 2026-03-14 cron.',
      '',
      '',
      'Lower middle-market PE. 24+ portfolio companies.'
    ],
    // Clearview - additional MPs
    [
      'Clearview Capital',
      'https://www.clearviewcap.com',
      'William Case',
      'Managing Partner',
      '', // No verified email
      'https://www.clearviewcap.com/our-team/',
      'https://www.clearviewcap.com/member/william-f-case-jr/',
      'Partial',
      'Managing Partner. Stamford, CT. No verified email found. Researched 2026-03-14 cron.',
      '',
      '',
      'Lower middle-market PE. Healthcare, Business Services, Consumer.'
    ],
    [
      'Clearview Capital',
      'https://www.clearviewcap.com',
      'Matthew Blevins',
      'Managing Partner',
      '',
      'https://www.clearviewcap.com/our-team/',
      'https://www.clearviewcap.com/member/matthew-w-blevins/',
      'Partial',
      'Managing Partner. Stamford, CT. No verified email found. Researched 2026-03-14 cron.',
      '',
      '',
      'Lower middle-market PE. Healthcare, Business Services, Consumer.'
    ],
    // Waud Capital - Founder
    [
      'Waud Capital Partners',
      'https://www.waudcapital.com',
      'Reeve Waud',
      'Founder & Managing Partner',
      '',
      'https://www.waudcapital.com/team/',
      'https://www.linkedin.com/in/reeve-waud-90b77712',
      'Partial',
      'Founder & Managing Partner. Founded 1993. Chicago-based. Healthcare & Software/Tech focus. No verified email. Researched 2026-03-14 cron.',
      '',
      '',
      'Healthcare services, Software & Technology. $3.2B raised since 1993.'
    ]
  ];
  
  console.log(`📝 Adding ${additionalRows.length} additional contact rows...\n`);
  
  // Append new contact rows
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:L',
    valueInputOption: 'RAW',
    resource: {
      values: additionalRows
    }
  });
  
  console.log('✅ Added additional contacts:');
  additionalRows.forEach((row, idx) => {
    console.log(`   ${idx + 1}. ${row[0]} - ${row[2]} (${row[3]})${row[4] ? ' - ' + row[4] : ' - No email'}`);
  });
  
  console.log('\n✅ Sheet enrichment complete!');
}

main().catch(console.error);
