const {google} = require('googleapis');

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({version:'v4', auth: await auth.getClient()});
  const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

  // Add new firms (rows 100+)
  const newFirms = [
    [
      'Argonaut Private Equity',   // Company Name
      '',                           // Contact Name
      '',                           // Title
      '',                           // Email
      'https://argonautpe.com',    // Website
      'https://www.linkedin.com/company/argonautpe/', // LinkedIn
      'Business services, industrial, consumer',  // Sector Focus
      'Bandera Utility, various mid-market',  // Portfolio Companies
      'New',                        // Status
      '',                           // Last Contacted
      'Tulsa OK. $2B+ managed. Founded 2004. George B. Kaiser (founder, billionaire). #14 Axial 2025 Top 20. Minimal public info — team page loads dynamically, no emails or team names published. Contact form only. Phone: 918-392-9650. 7030 S. Yale Ave Ste 800, Tulsa OK 74136.', // Notes
      'https://argonautpe.com/team/', // Company Info URL
      '6'                           // Gumbo Score
    ],
    [
      'Clearwell Group',
      'Ryan Cortner',
      'Partner',
      '',
      'https://clearwellgroup.com',
      'https://www.linkedin.com/company/clearwell-group',
      'Manufacturing, business services, healthcare, software, financial services',
      'Steadfast Alliance, Valor Environmental, Iron Container, Advanced Drying Systems, National Boiler Service',
      'New',
      '',
      'Tampa FL. Family office + PE. #11 Axial 2025 Top 20. 25+ investments. Ryan Cortner (Partner). Tyler Franz (Principal). Faith-based family culture, generational focus. Advisory Board: William Boer (Grey Dunes), Drew Graham (Ballast Point Ventures). Phone: 813-435-5600. No published emails. Contact form only.',
      'https://clearwellgroup.com/team/',
      '7'
    ],
  ];

  // Append new rows
  if (newFirms.length > 0) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'A1',
      valueInputOption: 'RAW',
      requestBody: { values: newFirms }
    });
    console.log(`Added ${newFirms.length} new firms`);
  }

  console.log('Done!');
}

main().catch(e => { console.error(e.message); process.exit(1); });
