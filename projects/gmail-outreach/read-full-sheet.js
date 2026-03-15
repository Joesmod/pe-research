const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:Z',
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }

  const headers = rows[0];
  const data = rows.slice(1);

  // Find column indices
  const companyIdx = headers.indexOf('Company Name');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const statusIdx = headers.indexOf('Status');
  const notesIdx = headers.indexOf('Notes');

  console.log(`\n📊 Total firms: ${data.length}`);
  console.log(`\n🔍 Column mapping:`);
  console.log(`  Company: column ${companyIdx} (${String.fromCharCode(65 + companyIdx)})`);
  console.log(`  Contact: column ${contactIdx} (${String.fromCharCode(65 + contactIdx)})`);
  console.log(`  Email: column ${emailIdx} (${String.fromCharCode(65 + emailIdx)})`);
  console.log(`  Status: column ${statusIdx} (${String.fromCharCode(65 + statusIdx)})`);

  // Find rows that need enrichment
  const needsEnrichment = [];

  data.forEach((row, idx) => {
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';

    // Check if needs enrichment: no contact name OR generic/missing email
    const hasNoContact = !contact || contact.trim() === '';
    const hasGenericEmail = !email || 
      email.includes('info@') || 
      email.includes('sales@') || 
      email.includes('ir@') ||
      email.includes('contact@') ||
      email.trim() === '';

    if (company && (hasNoContact || hasGenericEmail) && status !== 'Dead Lead') {
      needsEnrichment.push({
        rowNum: idx + 2, // +2 because 0-indexed + header row
        company,
        contact,
        email,
        status,
        issue: hasNoContact ? 'No contact' : 'Generic/missing email'
      });
    }
  });

  console.log(`\n🎯 Leads needing enrichment: ${needsEnrichment.length}`);
  console.log(`\n📋 First 15 targets:\n`);
  
  needsEnrichment.slice(0, 15).forEach((lead, idx) => {
    console.log(`${idx + 1}. Row ${lead.rowNum}: ${lead.company}`);
    console.log(`   Issue: ${lead.issue}`);
    console.log(`   Current contact: "${lead.contact || 'EMPTY'}"`);
    console.log(`   Current email: "${lead.email || 'EMPTY'}"`);
    console.log('');
  });

  // Save to JSON for reference
  const fs = require('fs');
  fs.writeFileSync(
    'enrichment-targets-march11-6pm.json',
    JSON.stringify(needsEnrichment.slice(0, 15), null, 2)
  );
  console.log('✅ Saved targets to enrichment-targets-march11-6pm.json\n');
}

main().catch(console.error);
