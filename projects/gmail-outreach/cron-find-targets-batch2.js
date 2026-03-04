const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Read previous targets to avoid duplicates
const batch1 = JSON.parse(fs.readFileSync('selected-targets-0336pm.json', 'utf8'));
const batch1Companies = new Set(batch1.map(t => t.company));

async function readSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:J',
  });

  return response.data.values || [];
}

async function main() {
  console.log('=== Finding Enrichment Targets (Batch 2) ===\n');

  const rows = await readSheet();
  const targets = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const contactName = row[1] || '';
    const title = row[2] || '';
    const email = row[3] || '';
    const status = row[8] || '';

    // Skip if already contacted or enriched
    if (status === 'Contacted' || status === 'Enriched' || status === 'Replied') {
      continue;
    }

    // Skip duplicates
    if (status === 'DUPLICATE') {
      continue;
    }

    // Skip if in batch 1
    if (batch1Companies.has(company.trim())) {
      continue;
    }

    // Need enrichment if:
    // 1. No contact name, OR
    // 2. No email, OR
    // 3. Generic email (info@, sales@, ir@, contact@)
    const needsEnrichment = 
      !contactName ||
      !email ||
      email.match(/^(info|sales|ir|contact|admin|support)@/i);

    if (needsEnrichment && company) {
      targets.push({
        index: i,
        company: company.trim(),
        contactName: contactName.trim(),
        title: title.trim(),
        email: email.trim(),
        status: status.trim(),
        reason: !contactName ? 'NoContact' : !email ? 'NoEmail' : 'GenericEmail'
      });
    }
  }

  console.log(`Total firms needing enrichment: ${targets.length}\n`);

  // Pick first 10 that don't have status "Researched"
  const freshTargets = targets
    .filter(t => t.status !== 'Researched')
    .slice(0, 10);

  console.log(`Selected ${freshTargets.length} fresh targets:\n`);
  freshTargets.forEach((t, idx) => {
    console.log(`${idx + 1}. ${t.company} (row ${t.index + 1}) - ${t.reason}`);
  });

  // Save to file
  fs.writeFileSync(
    'selected-targets-batch2.json',
    JSON.stringify(freshTargets, null, 2)
  );

  console.log(`\n✓ Saved to selected-targets-batch2.json`);
}

main().catch(console.error);
