const {google} = require('googleapis');
const auth = new google.auth.GoogleAuth({
  keyFile: 'projects/gmail-outreach/service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

(async () => {
  const sheets = google.sheets({version: 'v4', auth: await auth.getClient()});
  const sid = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Row 60: PSG Equity — update Contact, Title, Email, LinkedIn, Status, Notes
  await sheets.spreadsheets.values.update({
    spreadsheetId: sid,
    range: 'Sheet1!B60:B60',
    valueInputOption: 'RAW',
    requestBody: { values: [['Bill Aliber']] }
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId: sid,
    range: 'Sheet1!C60:C60',
    valueInputOption: 'RAW',
    requestBody: { values: [['Managing Director']] }
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId: sid,
    range: 'Sheet1!D60:D60',
    valueInputOption: 'RAW',
    requestBody: { values: [['william.aliber@psgequity.com']] }
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId: sid,
    range: 'Sheet1!F60:F60',
    valueInputOption: 'RAW',
    requestBody: { values: [['https://www.linkedin.com/company/psgequity/']] }
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId: sid,
    range: 'Sheet1!I60:I60',
    valueInputOption: 'RAW',
    requestBody: { values: [['Enriched']] }
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId: sid,
    range: 'Sheet1!K60:K60',
    valueInputOption: 'RAW',
    requestBody: { values: [['Email verified from psgequity.com/team/bill-aliber. MD in Kansas City office. 20yr CFO experience, boards: Chatmeter, Conversica, LivTech, Next Glass. Phone: 816.895.4301. 2026-02-18 enrichment.']] }
  });
  console.log('Row 60 (PSG Equity) updated');

  // Row 161: Thomas H. Lee Partners — update Notes with what we found
  await sheets.spreadsheets.values.update({
    spreadsheetId: sid,
    range: 'Sheet1!K161:K161',
    valueInputOption: 'RAW',
    requestBody: { values: [['No direct emails published on thl.com. Contact via EA: jgenelli@thl.com (Jennifer Genelli, EA to Co-CEO Todd Abbrecht). Co-CEOs: Todd Abbrecht, Scott Sperling. Has TABS (Tech & Business Solutions), FTS, Healthcare, Automation verticals. AI-focused: podcast on AI implementation with Alex Sabel. Boston HQ, 617-227-1050. 2026-02-18 research.']] }
  });
  console.log('Row 161 (THL) notes updated');

  // Row 195: Vance Street Capital — update Contact Name, Title, Notes
  await sheets.spreadsheets.values.update({
    spreadsheetId: sid,
    range: 'Sheet1!B195:B195',
    valueInputOption: 'RAW',
    requestBody: { values: [['Natalie Yates']] }
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId: sid,
    range: 'Sheet1!C195:C195',
    valueInputOption: 'RAW',
    requestBody: { values: [['Head of Business Development']] }
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId: sid,
    range: 'Sheet1!D195:D195',
    valueInputOption: 'RAW',
    requestBody: { values: [['']] }  // Clear generic email, no verified personal email
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId: sid,
    range: 'Sheet1!K195:K195',
    valueInputOption: 'RAW',
    requestBody: { values: [['Natalie Yates identified as Head of BD from vancestreetcapital.com/team/natalie-yates/. Phone: 310-231-7100. No direct email published. Managing Partners: Brian Martin, Michael Janish. Senior Operating Partners: Andy Kirkpatrick, David Montecalvo, Paul Salazar. LA-based. 2026-02-18 enrichment. Apollo credits exhausted — need upgrade for email discovery.']] }
  });
  console.log('Row 195 (Vance Street) updated');

  // Row 198: Valeas Capital — update notes
  await sheets.spreadsheets.values.update({
    spreadsheetId: sid,
    range: 'Sheet1!K198:K198',
    valueInputOption: 'RAW',
    requestBody: { values: [['SF-based. Only generic emails: info@valeas.com, ir@valeas.com. PR via FGS Global (Valeas@fgsglobal.com). Rob Little listed but rob@valeas.com NOT verified from official source. /people/ page returns 404. Suite 3910, 101 California St, SF. Phone: (415) 992-3131. 2026-02-18 research.']] }
  });
  console.log('Row 198 (Valeas) updated');

  // Also add PSG contact to Contacts sheet
  const contactsR = await sheets.spreadsheets.values.get({
    spreadsheetId: sid,
    range: 'Contacts!A1:I1'
  });
  console.log('Contacts headers:', JSON.stringify(contactsR.data.values[0]));
  
  await sheets.spreadsheets.values.append({
    spreadsheetId: sid,
    range: 'Contacts!A:I',
    valueInputOption: 'RAW',
    requestBody: {
      values: [['PSG Equity', '6', 'Bill Aliber', 'Managing Director', 'william.aliber@psgequity.com', 'Verified', '', 'Email from psgequity.com/team/bill-aliber. MD Kansas City. Boards: Chatmeter, Conversica, LivTech, Next Glass.', '']]
    }
  });
  console.log('PSG Equity contact added to Contacts sheet');
})();
