const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  console.log('📊 Reading sheet...');
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:Q',
  });

  const rows = response.data.values;
  const headers = rows[0];

  // Find column indices
  const companyIdx = headers.indexOf('Company Name');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const statusIdx = headers.indexOf('Status');
  const titleIdx = headers.indexOf('Title');
  const linkedinIdx = headers.indexOf('LinkedIn');
  const notesIdx = headers.indexOf('Notes');
  const websiteIdx = headers.indexOf('Website');

  console.log('Column indices:', {
    Company: companyIdx,
    Contact: contactIdx,
    Email: emailIdx,
    Status: statusIdx,
    Title: titleIdx,
    LinkedIn: linkedinIdx,
    Notes: notesIdx,
    Website: websiteIdx
  });

  // Find leads needing enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] || [];
    const company = (row[companyIdx] || '').trim();
    const contact = (row[contactIdx] || '').trim();
    const email = (row[emailIdx] || '').trim();
    const status = (row[statusIdx] || '').trim();
    const website = (row[websiteIdx] || '').trim();

    if (!company) continue;

    // Check if needs enrichment
    const hasNoContact = !contact || contact === '';
    const hasGenericEmail = email && (
      email.startsWith('info@') ||
      email.startsWith('sales@') ||
      email.startsWith('ir@') ||
      email.startsWith('contact@') ||
      email.startsWith('hello@') ||
      email.startsWith('team@')
    );
    const needsWork = status !== 'Enriched' && status !== 'Dead' && (hasNoContact || hasGenericEmail);

    if (needsWork) {
      needsEnrichment.push({
        row: i + 1,
        company,
        contact,
        email,
        status,
        website,
        reason: hasNoContact ? 'No contact' : 'Generic email'
      });
    }
  }

  console.log(`\n✅ Found ${needsEnrichment.length} leads needing enrichment\n`);

  // Save to file for research
  fs.writeFileSync(
    'enrichment-targets-march11-537pm.json',
    JSON.stringify(needsEnrichment.slice(0, 15), null, 2)
  );

  console.log('📋 Top 15 targets saved to: enrichment-targets-march11-537pm.json');
  console.log('\nSample targets:');
  needsEnrichment.slice(0, 5).forEach((target, idx) => {
    console.log(`  ${idx + 1}. ${target.company} (Row ${target.row}) - ${target.reason}`);
    if (target.website) console.log(`     Website: ${target.website}`);
  });
}

main().catch(console.error);
