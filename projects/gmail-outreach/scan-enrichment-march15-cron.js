const { google } = require('googleapis');

async function run() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A1:N1000'
  });

  const rows = response.data.values;
  if (!rows || rows.length < 2) {
    console.log('No data found.');
    return;
  }

  const needsEnrichment = [];

  // Skip header row (row 0)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    
    const companyName = row[0] || '';
    const notebookLM = row[1] || '';
    const contactName = row[2] || '';
    const title = row[3] || '';
    const email = row[4] || '';
    const field5 = row[5] || '';
    const linkedIn = row[6] || '';
    const status = row[7] || '';

    // Skip if no company name (empty row)
    if (!companyName.trim()) continue;

    // Skip if Dead or already Enriched
    if (status === 'Dead') continue;

    // Check if needs enrichment
    const noContact = !contactName || contactName.trim() === '';
    const noEmail = !email || email.trim() === '';
    const hasGenericEmail = email.match(/^(info@|sales@|ir@|contact@|admin@|support@)/i);
    
    if (noContact || noEmail || hasGenericEmail) {
      needsEnrichment.push({
        row: i + 1,
        companyName,
        notebookLM,
        contactName: contactName || '(none)',
        email: email || '(none)',
        status,
        reason: noContact ? 'No contact' : hasGenericEmail ? 'Generic email' : 'No email'
      });
    }
  }

  console.log(`Total firms needing enrichment: ${needsEnrichment.length}\n`);
  console.log('=== TOP 15 PRIORITY TARGETS ===\n');
  
  needsEnrichment.slice(0, 15).forEach((lead, idx) => {
    console.log(`${idx + 1}. Row ${lead.row}: ${lead.companyName}`);
    console.log(`   Contact: ${lead.contactName} | Email: ${lead.email}`);
    console.log(`   Reason: ${lead.reason} | Status: ${lead.status}`);
    console.log(`   URL: ${lead.notebookLM}`);
    console.log('');
  });

  // Save to file for processing
  const fs = require('fs');
  fs.writeFileSync('enrichment-targets-march15-cron.json', JSON.stringify(needsEnrichment.slice(0, 15), null, 2));
  console.log('Saved top 15 targets to enrichment-targets-march15-cron.json');
}

run().catch(console.error);
