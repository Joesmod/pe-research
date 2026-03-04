const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Verified contacts found through research - March 3, 2026
const newContacts = [
  ['Goode Partners', 'David Oddi', 'Partner', 'doddi@goodepartners.com', 'https://www.goodepartners.com/team/david', '', '', 'Enriched', 'Verified from official website team page', '', ''],
  ['Goode Partners', 'Joe Ferreira', 'Partner Emeritus', 'jferreira@goodepartners.com', 'https://www.goodepartners.com/team/joe', '', '', 'Enriched', 'Verified from official website team page', '', ''],
  ['KLH Capital', 'Kyle Madden', 'Partner', 'kmadden@klhcapital.com', 'https://www.linkedin.com/in/kyle-madden-73311b1a', '', '', 'Enriched', 'Verified from official website team page', '', ''],
  ['KLH Capital', 'Ron Moore', 'Director', 'rmoore@klhcapital.com', 'https://www.linkedin.com/in/ron-moore-289a0171', '', '', 'Enriched', 'Verified from official website team page', '', ''],
  ['KLH Capital', 'Peter Rozin', 'Associate', 'prozin@klhcapital.com', 'https://www.linkedin.com/in/peterrozin/', '', '', 'Enriched', 'Verified from official website team page', '', ''],
  ['Invision Capital', 'Robert Castillo', 'Managing Director', 'RCastillo@invcg.com', '', '', '', 'Enriched', 'Verified from official website team page', '', '']
];

async function appendContacts() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:K',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: newContacts
    }
  });
  
  console.log(`Appended ${newContacts.length} enriched contacts to the sheet.`);
}

appendContacts().catch(console.error);
