const { google } = require('googleapis');
const fs = require('fs');

async function readSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A:J'
  });

  const rows = res.data.values || [];
  if (rows.length === 0) {
    console.log('No data found.');
    return;
  }

  const headers = rows[0];
  console.log('Headers:', headers);
  console.log('\nTotal rows:', rows.length - 1);

  // Find needs enrichment
  const companyIdx = headers.indexOf('Company');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const statusIdx = headers.indexOf('Status');

  let needsEnrichment = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';

    // Skip if status is Dead/Bounced/Unsubscribe
    if (status.match(/dead|bounce|unsub/i)) continue;

    // Check if needs enrichment
    const needsContact = !contact || contact.trim() === '';
    const hasGenericEmail = email && email.match(/^(info|sales|ir|contact|admin)@/i);
    const needsEmail = !email || email.trim() === '' || hasGenericEmail;

    if (needsContact || needsEmail) {
      needsEnrichment.push({
        row: i + 1,
        company,
        contact,
        email,
        status,
        needsContact,
        needsEmail
      });
    }
  }

  console.log('\n=== NEEDS ENRICHMENT ===');
  console.log(`Found ${needsEnrichment.length} firms needing enrichment\n`);

  needsEnrichment.slice(0, 20).forEach(lead => {
    console.log(`Row ${lead.row}: ${lead.company}`);
    console.log(`  Contact: ${lead.contact || '[EMPTY]'}`);
    console.log(`  Email: ${lead.email || '[EMPTY]'}`);
    console.log(`  Status: ${lead.status}`);
    console.log('');
  });

  fs.writeFileSync('enrich-needs-march9-606am.json', JSON.stringify(needsEnrichment, null, 2));
  console.log(`\nSaved ${needsEnrichment.length} targets to enrich-needs-march9-606am.json`);
}

readSheet().catch(console.error);
