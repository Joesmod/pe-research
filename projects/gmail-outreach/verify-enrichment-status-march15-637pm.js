const { google } = require('googleapis');

async function verifyStatus() {
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
    console.log(`Total rows: ${rows.length}`);

    // Count by status
    const statusCount = {};
    let emptyContact = 0;
    let genericEmail = 0;
    let emptyEmail = 0;
    let enrichable = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const company = row[0] || '';
      const contact = row[2] || '';
      const email = row[4] || '';
      const status = row[7] || 'Active';

      statusCount[status] = (statusCount[status] || 0) + 1;

      const hasGenericEmail = email.match(/^(info@|sales@|ir@|contact@|admin@)/i);
      if (!contact || contact.trim() === '') emptyContact++;
      if (!email || email.trim() === '') emptyEmail++;
      if (hasGenericEmail) genericEmail++;

      // Find enrichable leads (ANY status)
      if (!contact || !email || hasGenericEmail) {
        enrichable.push({
          row: i + 1,
          company,
          contact: contact || '(empty)',
          email: email || '(empty)',
          status,
          issue: !contact ? 'No contact' : !email ? 'No email' : 'Generic email'
        });
      }
    }

    console.log('\n=== STATUS BREAKDOWN ===');
    Object.entries(statusCount).sort((a, b) => b[1] - a[1]).forEach(([status, count]) => {
      console.log(`${status}: ${count}`);
    });

    console.log('\n=== ENRICHMENT GAPS ===');
    console.log(`Empty contact: ${emptyContact}`);
    console.log(`Empty email: ${emptyEmail}`);
    console.log(`Generic email: ${genericEmail}`);
    console.log(`Total enrichable: ${enrichable.length}`);

    if (enrichable.length > 0) {
      console.log('\n=== FIRST 20 ENRICHABLE (ANY STATUS) ===');
      enrichable.slice(0, 20).forEach(lead => {
        console.log(`Row ${lead.row}: ${lead.company.padEnd(40)} | ${lead.issue.padEnd(15)} | Status: ${lead.status}`);
      });
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

verifyStatus();
