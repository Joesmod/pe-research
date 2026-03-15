const {google} = require('googleapis');

async function addHCI() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({version: 'v4', auth});
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const newRow = [
    'HCI Equity Partners',
    'https://www.hciequity.com',
    'Tim Frend',
    'Partner (Deal Origination)',
    'tfrend@hciequity.com',
    'https://www.hciequity.com',
    'https://www.linkedin.com/company/hci-equity-partners',
    'Manufacturing, Distribution, Technician Services',
    'Washington DC-based lower middle market PE. Focus: family/founder-owned businesses in manufacturing, distribution, technician-based services. Portfolio: AmerCareRoyal, residential foundation repair platform. Named BluWave 2026 Top PE Innovator. Top quartile deal originator.',
    'Enriched',
    'Email verified from official HCI press releases (Oct 2023, Nov 2025). Also: Michael Allen (mallen@hciequity.com), Nate Novak (nnovak@hciequity.com), Douglas McCormick (Managing Partner/Co-Founder). Pattern: firstinitiallastname@hciequity.com [2026-03-08 cron]'
  ];
  
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Sheet1!A:K',
    valueInputOption: 'RAW',
    resource: {
      values: [newRow]
    }
  });
  
  console.log('✅ Added HCI Equity Partners');
}

addHCI().catch(console.error);
