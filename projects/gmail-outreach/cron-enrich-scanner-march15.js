const { google } = require('googleapis');

async function scanEnrichmentNeeds() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A1:N1000',
  });

  const rows = response.data.values;
  console.log('Total rows in sheet:', rows.length);

  // Column mapping (based on inspection)
  // A: Company Name
  // B: NotebookLM/Website
  // C: Contact Name
  // D: Title
  // E: Email
  // F: (something)
  // G: LinkedIn URL
  // H: Status (primary)
  // I: Notes (primary)
  // J: Status (secondary/old?)
  // K: Last Contacted
  // L: Notes (secondary)
  // M: Company Info URL
  // N: Gumbo Score

  let needsEnrichment = [];
  let enriched = 0;
  let dead = 0;

  for (let i = 1; i < rows.length; i++) { // Skip row 1 (headers mixed with data)
    const row = rows[i] || [];
    const company = (row[0] || '').trim();
    const contactName = (row[2] || '').trim();
    const email = (row[4] || '').trim();
    const status = (row[7] || '').trim(); // Column H
    const statusAlt = (row[9] || '').trim(); // Column J

    if (!company) continue; // Skip empty rows

    // Check status
    if (status === 'Dead' || statusAlt === 'Dead') {
      dead++;
      continue;
    }

    if (status === 'Enriched' || statusAlt === 'Enriched') {
      enriched++;
      continue;
    }

    // Check if needs enrichment
    const hasNoContact = !contactName || contactName === '';
    const hasNoEmail = !email || email === '';
    const hasGenericEmail = email.match(/^(info@|sales@|ir@|contact@|admin@|hello@|support@)/i);

    if (hasNoContact || hasNoEmail || hasGenericEmail) {
      needsEnrichment.push({
        row: i + 1,
        company,
        contactName: contactName || '(empty)',
        email: email || '(empty)',
        status: status || statusAlt || '(none)',
        reason: hasNoContact ? 'No contact' : hasGenericEmail ? `Generic email: ${email}` : 'No email'
      });
    }
  }

  console.log('\n=== SUMMARY ===');
  console.log('Enriched:', enriched);
  console.log('Dead:', dead);
  console.log('Needs Enrichment:', needsEnrichment.length);

  console.log('\n=== FIRST 15 NEEDING ENRICHMENT ===');
  needsEnrichment.slice(0, 15).forEach(lead => {
    console.log(`Row ${lead.row}: ${lead.company} | ${lead.reason} | Contact: ${lead.contactName} | Email: ${lead.email}`);
  });

  return needsEnrichment.slice(0, 15);
}

scanEnrichmentNeeds().catch(console.error);
