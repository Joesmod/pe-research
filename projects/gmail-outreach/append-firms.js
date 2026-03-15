const { google } = require('googleapis');

async function appendFirms() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // New firms to append
  const newRows = [
    [
      'Trivest Partners',
      '8',
      'Troy Templeton',
      'Managing Partner',
      'info@trivest.com',
      'generic',
      'https://www.linkedin.com/company/trivestpartners',
      'Managing Partner leads firm. Other partners: Jamie Elias, Chip Vandenberg, Earl Powell. Founder-focused PE, 6 offices (Miami HQ). Generic email from factsheet PDF. Source: trivest.com 2026-03-14',
      '',
      '',
      '',
      '',
      ''
    ],
    [
      'Trivest Partners',
      '8',
      'Jamie Elias',
      'Partner',
      'info@trivest.com',
      'generic',
      '',
      'Partner leading non-control investments (TGIF II fund). Miami-based. Source: trivest.com press releases 2026-03-14',
      '',
      '',
      '',
      '',
      ''
    ]
  ];
  
  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Contacts!A:M',
      valueInputOption: 'RAW',
      resource: { values: newRows }
    });
    console.log(`Appended ${newRows.length} new rows:`, response.data.updates.updatedRange);
  } catch (error) {
    console.error('Error appending rows:', error.message);
  }
}

appendFirms().catch(console.error);
