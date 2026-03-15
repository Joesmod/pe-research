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
    range: 'Sheet1!A:N',
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }

  // Skip header row
  const data = rows.slice(1);

  // Column indices (based on inspection)
  const companyIdx = 0;  // A: Company Name
  const websiteIdx = 1;  // B: Company Website
  const contactIdx = 2;  // C: Contact Name
  const titleIdx = 3;    // D: Title
  const emailIdx = 4;    // E: Email
  const statusIdx = 9;   // J: Status
  const notesIdx = 11;   // L: Notes

  console.log(`\n📊 Total firms: ${data.length}`);

  // Find rows that need enrichment
  const needsEnrichment = [];

  data.forEach((row, idx) => {
    const company = row[companyIdx] || '';
    const website = row[websiteIdx] || '';
    const contact = row[contactIdx] || '';
    const title = row[titleIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';

    // Skip dead leads
    if (status.toLowerCase().includes('dead')) return;

    // Check if needs enrichment: no contact name OR generic/missing email
    const hasNoContact = !contact || contact.trim() === '';
    const hasGenericEmail = !email || 
      email.toLowerCase().includes('info@') || 
      email.toLowerCase().includes('sales@') || 
      email.toLowerCase().includes('ir@') ||
      email.toLowerCase().includes('contact@') ||
      email.trim() === '';

    if (company && (hasNoContact || hasGenericEmail)) {
      needsEnrichment.push({
        rowNum: idx + 2, // +2 because 0-indexed + header row
        company,
        website,
        contact: contact || '',
        title: title || '',
        email: email || '',
        status,
        issue: hasNoContact ? 'No contact name' : 'Generic/missing email'
      });
    }
  });

  console.log(`\n🎯 Leads needing enrichment: ${needsEnrichment.length}`);
  
  // Prioritize those with no contact at all
  const noContactLeads = needsEnrichment.filter(l => l.issue === 'No contact name');
  const genericEmailLeads = needsEnrichment.filter(l => l.issue === 'Generic/missing email');

  console.log(`  - ${noContactLeads.length} with no contact name`);
  console.log(`  - ${genericEmailLeads.length} with generic/missing email`);

  // Select first 15 (prioritize no contact)
  const targets = [
    ...noContactLeads.slice(0, 10),
    ...genericEmailLeads.slice(0, 5)
  ].slice(0, 15);

  console.log(`\n📋 Top 15 targets for enrichment:\n`);
  
  targets.forEach((lead, idx) => {
    console.log(`${idx + 1}. Row ${lead.rowNum}: ${lead.company}`);
    console.log(`   Website: ${lead.website || 'NONE'}`);
    console.log(`   Issue: ${lead.issue}`);
    console.log(`   Current contact: "${lead.contact || 'EMPTY'}"`);
    console.log(`   Current email: "${lead.email || 'EMPTY'}"`);
    console.log(`   Status: ${lead.status || 'NONE'}`);
    console.log('');
  });

  // Save to JSON for reference
  const fs = require('fs');
  fs.writeFileSync(
    'enrichment-targets-march13-237pm.json',
    JSON.stringify(targets, null, 2)
  );
  console.log('✅ Saved targets to enrichment-targets-march13-237pm.json\n');
}

main().catch(console.error);
