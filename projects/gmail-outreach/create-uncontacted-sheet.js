const fs = require('fs');
const {google} = require('googleapis');

const CREDS_PATH = __dirname + '/service-account.json';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

(async () => {
  // Auth with service account
  const creds = JSON.parse(fs.readFileSync(CREDS_PATH));
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const client = await auth.getClient();
  const sheets = google.sheets({version: 'v4', auth: client});
  
  // Read Contacts sheet
  console.log('Reading Contacts sheet...');
  const contactsRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Contacts!A:Z'
  });
  const contactsRows = contactsRes.data.values || [];
  console.log(`Found ${contactsRows.length} total rows in Contacts`);
  
  // Read Outreach Log sheet
  console.log('Reading Outreach Log...');
  const outreachRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Outreach Log!A:Z'
  });
  const outreachRows = outreachRes.data.values || [];
  
  // Extract contacted emails (column D in Outreach Log)
  const contactedEmails = new Set();
  outreachRows.slice(1).forEach(row => {
    const email = row[3]; // Column D (0-indexed = 3)
    if (email && email.includes('@')) {
      contactedEmails.add(email.toLowerCase().trim());
    }
  });
  
  console.log(`Found ${contactedEmails.size} unique contacted emails`);
  
  // Filter Contacts to uncontacted only
  const header = contactsRows[0] || [];
  const emailColIndex = header.findIndex(h => h && h.toLowerCase().includes('email'));
  
  console.log(`Email column index in Contacts: ${emailColIndex}`);
  
  if (emailColIndex === -1) {
    console.error('Could not find Email column in Contacts sheet');
    return;
  }
  
  const uncontacted = contactsRows.filter((row, idx) => {
    if (idx === 0) return true; // Keep header
    const email = row[emailColIndex];
    if (!email || !email.includes('@')) return false; // Skip empty/invalid emails
    return !contactedEmails.has(email.toLowerCase().trim());
  });
  
  console.log(`\nFiltered to ${uncontacted.length - 1} uncontacted leads (from ${contactsRows.length - 1} total contacts)`);
  
  // Create new sheet
  try {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      resource: {
        requests: [{
          addSheet: {
            properties: {
              title: 'Uncontacted Leads',
              gridProperties: {
                frozenRowCount: 1
              }
            }
          }
        }]
      }
    });
    console.log('✅ Created "Uncontacted Leads" sheet');
  } catch (e) {
    if (e.message.includes('already exists')) {
      console.log('Sheet "Uncontacted Leads" already exists, will overwrite...');
    } else {
      throw e;
    }
  }
  
  // Write uncontacted leads
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: 'Uncontacted Leads!A1',
    valueInputOption: 'RAW',
    resource: {
      values: uncontacted
    }
  });
  
  console.log(`✅ Wrote ${uncontacted.length - 1} uncontacted leads to sheet`);
  console.log(`\nSheet URL: https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit#gid=0`);
  
  // Summary
  console.log(`\n=== Summary ===`);
  console.log(`Total contacts in CRM: ${contactsRows.length - 1}`);
  console.log(`Already contacted: ${contactedEmails.size}`);
  console.log(`Uncontacted leads: ${uncontacted.length - 1}`);
  console.log(`Percentage uncontacted: ${Math.round((uncontacted.length - 1) / (contactsRows.length - 1) * 100)}%`);
  
})().catch(e => console.error('Error:', e.message));
