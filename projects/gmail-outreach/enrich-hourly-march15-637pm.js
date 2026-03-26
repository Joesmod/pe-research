const { google } = require('googleapis');

async function enrichLeads() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

    // Read Sheet1 (no header row, data starts at Row 1)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A1:M1000',
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found.');
      return;
    }

    console.log(`Total rows: ${rows.length}`);

    // Column indices (0-based, no header row):
    // A=0: Company Name
    // B=1: NotebookLM URL
    // C=2: Contact Name
    // D=3: Title
    // E=4: Email
    // F=5: ?
    // G=6: LinkedIn
    // H=7: Status
    // I=8: Notes

    let needsEnrichment = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const company = row[0] || '';
      const contact = row[2] || '';
      const email = row[4] || '';
      const status = row[7] || '';

      // Skip if already Dead or has "Sent" in status
      if (status.includes('Dead') || status.includes('Sent')) continue;

      // Check if needs enrichment
      const hasGenericEmail = email.match(/^(info@|sales@|ir@|contact@|admin@)/i);
      const noContact = !contact || contact.trim() === '';
      const noEmail = !email || email.trim() === '';

      if (noContact || noEmail || hasGenericEmail) {
        needsEnrichment.push({
          row: i + 1,
          company,
          contact,
          email,
          status,
          reason: noContact ? 'No contact' : noEmail ? 'No email' : 'Generic email'
        });
      }
    }

    console.log(`\nLeads needing enrichment: ${needsEnrichment.length}`);
    console.log('\nTop 15 to enrich:');
    const toEnrich = needsEnrichment.slice(0, 15);
    toEnrich.forEach((lead, idx) => {
      console.log(`\n${idx + 1}. Row ${lead.row}: ${lead.company}`);
      console.log(`   Reason: ${lead.reason}`);
      console.log(`   Current: ${lead.contact || '(none)'} | ${lead.email || '(none)'}`);
      console.log(`   Status: ${lead.status || 'Active'}`);
    });

    console.log('\n=== ENRICHMENT TARGETS ===');
    console.log(JSON.stringify(toEnrich, null, 2));

    return toEnrich;

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  }
}

enrichLeads();
