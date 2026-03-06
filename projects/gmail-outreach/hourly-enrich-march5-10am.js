const { google } = require('googleapis');
const key = require('./service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });

  // Read the sheet
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:J'
  });

  const rows = res.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found');
    return;
  }

  const headers = rows[0];
  console.log('Headers:', headers);

  // Find leads needing enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const website = row[1] || '';
    const contactName = row[2] || '';
    const title = row[3] || '';
    const email = row[4] || '';
    const status = row[8] || '';

    // Criteria: Empty contact name OR generic email OR status = "New - Unresearched" or "Partial"
    const hasGenericEmail = email && (
      email.toLowerCase().startsWith('info@') ||
      email.toLowerCase().startsWith('sales@') ||
      email.toLowerCase().startsWith('ir@') ||
      email.toLowerCase().startsWith('contact@')
    );

    const needsWork = (
      !contactName ||
      !email ||
      hasGenericEmail ||
      status === 'New - Unresearched' ||
      status === 'Partial'
    );

    if (needsWork && company && website) {
      needsEnrichment.push({
        rowIndex: i + 1,
        company,
        website,
        contactName,
        title,
        email,
        status,
        reason: !contactName ? 'No contact name' : 
                !email ? 'No email' :
                hasGenericEmail ? 'Generic email' :
                status
      });
    }
  }

  // Sort by priority: No email > Generic email > Partial > New
  needsEnrichment.sort((a, b) => {
    const scoreA = !a.email ? 4 : (a.email.startsWith('info@') || a.email.startsWith('sales@')) ? 3 :
                   a.status === 'Partial' ? 2 : 1;
    const scoreB = !b.email ? 4 : (b.email.startsWith('info@') || b.email.startsWith('sales@')) ? 3 :
                   b.status === 'Partial' ? 2 : 1;
    return scoreB - scoreA;
  });

  console.log(`\nFound ${needsEnrichment.length} leads needing enrichment\n`);
  console.log('TOP 15 PRIORITY TARGETS:\n');
  
  needsEnrichment.slice(0, 15).forEach((lead, idx) => {
    console.log(`${idx + 1}. ${lead.company}`);
    console.log(`   Website: ${lead.website}`);
    console.log(`   Current: ${lead.contactName || '(none)'} | ${lead.email || '(none)'}`);
    console.log(`   Status: ${lead.status} | Reason: ${lead.reason}`);
    console.log(`   Row: ${lead.rowIndex}\n`);
  });
}

main().catch(console.error);
