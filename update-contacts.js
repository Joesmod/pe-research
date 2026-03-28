const { google } = require('googleapis');
const key = require('../gmail-outreach/service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function updateContacts() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });

  // Gridiron Capital - Thomas Burger (verified from official press releases)
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!C91:H91',  // Row 91
    valueInputOption: 'RAW',
    requestBody: {
      values: [[
        'Thomas Burger',
        'Co-Founder & Managing Partner',
        'tburger@gridironcapital.com',
        '', // LinkedIn
        'Enriched',
        'Email from official Gridiron press release'
      ]]
    }
  });
  console.log('✓ Updated Gridiron Capital - Thomas Burger');

  // Yellowstone Capital Partners - Juan Carlos Moreno (verified from LinkedIn official post)
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!C264:H264',  // Row 264
    valueInputOption: 'RAW',
    requestBody: {
      values: [[
        'Juan Carlos Moreno',
        'Chief Investment Officer',
        'juan.moreno@yellowstonecp.com',
        'https://www.linkedin.com/in/juan-carlos-moreno-b686201b/',
        'Enriched',
        'Email from official LinkedIn post (Sept 2022)'
      ]]
    }
  });
  console.log('✓ Updated Yellowstone Capital Partners - Juan Carlos Moreno');

  // Riverside Company - Jeremy Holland (phone only, no email on official site)
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!C207:H207',  // Row 207
    valueInputOption: 'RAW',
    requestBody: {
      values: [[
        'Jeremy Holland',
        'Managing Partner, Origination',
        '', // No verified email
        'https://www.linkedin.com/in/jeremyrholland',
        'Partial',
        'Phone: +1 310 499 5084 (from official Riverside site). No direct email found on official sources.'
      ]]
    }
  });
  console.log('✓ Updated Riverside Company - Jeremy Holland (phone only)');

  console.log('\nUpdates complete!');
}

updateContacts().catch(console.error);
