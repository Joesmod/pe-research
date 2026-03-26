const { google } = require('googleapis');

async function readSheet() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A1:M1000',
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found.');
      return;
    }

    const headers = rows[0];
    console.log('Headers:', headers);
    console.log('\nTotal rows:', rows.length - 1);

    // Find leads needing enrichment
    const companyCol = headers.indexOf('Company');
    const contactCol = headers.indexOf('Contact Name');
    const emailCol = headers.indexOf('Email');
    const statusCol = headers.indexOf('Status');

    let needsEnrichment = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const company = row[companyCol] || '';
      const contact = row[contactCol] || '';
      const email = row[emailCol] || '';
      const status = row[statusCol] || '';

      // Skip if already Dead or Enriched
      if (status === 'Dead' || status === 'Enriched') continue;

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
    console.log('\nFirst 20 that need enrichment:');
    needsEnrichment.slice(0, 20).forEach(lead => {
      console.log(`Row ${lead.row}: ${lead.company} | ${lead.reason} | Current: ${lead.contact || '(none)'} ${lead.email || '(none)'}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

readSheet();
