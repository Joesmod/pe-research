const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = JSON.parse(fs.readFileSync('./service-account.json', 'utf8'));

async function readSheet() {
  const auth = new google.auth.JWT(
    SERVICE_ACCOUNT.client_email,
    null,
    SERVICE_ACCOUNT.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
  );

  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read Sheet1 data
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:L'
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }

  const headers = rows[0];
  console.log('Headers:', headers);
  
  // Find columns
  const companyIdx = headers.indexOf('Company');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const statusIdx = headers.indexOf('Status');

  // Find leads needing enrichment (empty contact or generic email)
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';

    // Skip if already Dead/Bad
    if (status === 'Dead' || status === 'Bad' || status === 'Sent') continue;

    const hasGenericEmail = email.match(/^(info@|sales@|ir@|contact@|hello@|support@)/i);
    const needsContact = !contact || contact.trim() === '';
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

  console.log(`\n✅ Total leads: ${rows.length - 1}`);
  console.log(`🔍 Needs enrichment: ${needsEnrichment.length}`);
  console.log('\n📋 Top 15 needing enrichment:\n');
  
  needsEnrichment.slice(0, 15).forEach((lead, idx) => {
    console.log(`${idx + 1}. ${lead.company} (Row ${lead.row})`);
    console.log(`   Contact: ${lead.contact || '❌ EMPTY'}`);
    console.log(`   Email: ${lead.email || '❌ EMPTY'}`);
    console.log(`   Issues: ${lead.needsContact ? 'Missing contact' : ''} ${lead.needsEmail ? 'Missing/generic email' : ''}`);
    console.log('');
  });

  // Save candidates
  fs.writeFileSync('./enrichment-candidates.json', JSON.stringify(needsEnrichment, null, 2));
  console.log('✅ Saved enrichment candidates to enrichment-candidates.json');
}

readSheet().catch(console.error);
