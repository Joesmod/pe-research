const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Wynnchurch Capital verified contacts - March 3, 2026
const wynnchurchContacts = [
  ['Wynnchurch Capital', 'John Hatherly', 'Founder & CEO', 'jhatherly@wynnchurch.com', 'https://www.wynnchurch.com/team/hatherly-john', '', '', 'Enriched', 'Verified from official website team page', '', ''],
  ['Wynnchurch Capital', 'Aron Beach', 'Managing Director', 'abeach@wynnchurch.com', 'https://www.wynnchurch.com/team/beach-aron', '', '', 'Enriched', 'Verified from official website team page', '', ''],
  ['Wynnchurch Capital', 'Alex DeAraujo', 'Managing Director', 'adearaujo@wynnchurch.com', 'https://www.wynnchurch.com/team/dearaujo-alex', '', '', 'Enriched', 'Verified from official website team page', '', ''],
  ['Wynnchurch Capital', 'Michael Teplitsky', 'Partner', 'mteplitsky@wynnchurch.com', 'https://www.wynnchurch.com/team/teplitsky-michael', '', '', 'Enriched', 'Verified from official website team page', '', ''],
  ['Wynnchurch Capital', 'Kevin Hanley', 'Managing Director', 'khanley@wynnchurch.com', 'https://www.wynnchurch.com/team/hanley-kevin', '', '', 'Enriched', 'Verified from official website team page', '', ''],
  ['Wynnchurch Capital', 'Brian Riordan', 'Vice President', 'briordan@wynnchurch.com', 'https://www.wynnchurch.com/team/riordan-brian', '', '', 'Enriched', 'Verified from official website team page', '', '']
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
      values: wynnchurchContacts
    }
  });
  
  console.log(`Appended ${wynnchurchContacts.length} Wynnchurch contacts to the sheet.`);
}

appendContacts().catch(console.error);
