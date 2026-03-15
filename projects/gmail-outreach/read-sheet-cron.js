const { google } = require('googleapis');

async function readSheet() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

    const result = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A:J'
    });

    const rows = result.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found');
      return;
    }

    const headers = rows[0];
    console.log('Headers:', headers.join(' | '));
    console.log('\nFirst 5 rows:');
    rows.slice(1, 6).forEach((row, idx) => {
      console.log(`Row ${idx + 2}:`, row.join(' | '));
    });

    // Find rows needing enrichment
    const contactIdx = headers.indexOf('Contact Name');
    const emailIdx = headers.indexOf('Email');
    const statusIdx = headers.indexOf('Status');
    
    console.log('\nColumn indices:', { contactIdx, emailIdx, statusIdx });

    const needsEnrichment = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const contact = row[contactIdx] || '';
      const email = row[emailIdx] || '';
      const status = row[statusIdx] || '';

      const hasEmptyContact = !contact.trim();
      const hasGenericEmail = /^(info|sales|ir|contact|admin|support)@/.test(email.toLowerCase());
      const hasEmptyEmail = !email.trim();

      if (hasEmptyContact || hasGenericEmail || hasEmptyEmail) {
        needsEnrichment.push({
          row: i + 1,
          company: row[0] || '',
          contact,
          email,
          status
        });
      }
    }

    console.log(`\nFound ${needsEnrichment.length} leads needing enrichment`);
    console.log('\nFirst 15 needing enrichment:');
    needsEnrichment.slice(0, 15).forEach(lead => {
      console.log(`Row ${lead.row}: ${lead.company} | Contact: "${lead.contact}" | Email: "${lead.email}" | Status: "${lead.status}"`);
    });

    // Output to JSON for processing
    const fs = require('fs');
    fs.writeFileSync('enrichment-needs-march10-1236am.json', JSON.stringify(needsEnrichment.slice(0, 15), null, 2));
    console.log('\nWrote 15 targets to enrichment-needs-march10-1236am.json');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

readSheet();
