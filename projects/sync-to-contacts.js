const {google} = require('googleapis');
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

(async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'projects/gmail-outreach/service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });

  // Get Sheet1 data
  const s1 = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Sheet1!A2:L300' });
  const rows = s1.data.values || [];

  // Get existing Contacts companies
  const c = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Contacts!A2:A500' });
  const contactFirms = new Set((c.data.values || []).map(r => r[0]));

  // Get next row
  const allContacts = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Contacts!A:A' });
  let nextRow = (allContacts.data.values || []).length + 1;

  // Filter: firms with real emails not already in Contacts
  const toSync = [];
  for (const row of rows) {
    const co = row[0] || '';
    const name = row[1] || '';
    const title = row[2] || '';
    const email = row[3] || '';
    const linkedin = row[5] || '';
    const status = row[8] || '';
    const notes = row[10] || '';

    if (status === 'Dead Lead' || status === 'DUPLICATE') continue;
    if (contactFirms.has(co)) continue;
    if (!email || email.match(/^(info@|sales@|ir@|contact@|media@|press@)/i)) continue;
    // Skip entries with multiple people in name (slashes)
    if (name.includes(' / ') && !name.match(/^[^/]+$/)) {
      // Take first person only
      const firstName = name.split(' / ')[0].trim();
      const firstTitle = title.split(' / ')[0].trim();
      toSync.push({ co, name: firstName, title: firstTitle, email, linkedin, notes: notes.slice(0, 200) });
    } else {
      toSync.push({ co, name, title, email, linkedin, notes: notes.slice(0, 200) });
    }
  }

  console.log(`Found ${toSync.length} contacts to sync to Contacts sheet`);

  // Contacts columns: Company | Gumbo Score | Contact Name | Title | Email | Email Status | LinkedIn | Research Notes | Last Contacted
  const newRows = toSync.map(c => [
    c.co,
    '8',
    c.name,
    c.title,
    c.email,
    'verified',
    c.linkedin,
    `Synced from Sheet1. ${c.notes}`,
    '' // Last Contacted
  ]);

  if (newRows.length > 0) {
    // Use append to auto-expand the sheet
    const result = await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Contacts!A:I',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: newRows }
    });
    console.log(`\n✅ Appended ${newRows.length} contacts to Contacts sheet`);
    console.log(`  Updated range: ${result.data.updates.updatedRange}`);
  }

  // Print summary by firm
  const firms = [...new Set(toSync.map(c => c.co))];
  console.log(`\nFirms synced: ${firms.length}`);
  firms.slice(0, 20).forEach(f => console.log(`  - ${f}`));
  if (firms.length > 20) console.log(`  ... and ${firms.length - 20} more`);
})();
