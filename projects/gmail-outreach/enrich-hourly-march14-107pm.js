const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

async function main() {
  // Auth
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  // Read sheet
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:O',
  });

  const rows = result.data.values || [];
  if (rows.length === 0) {
    console.log('No data found.');
    return;
  }

  const headers = rows[0];
  const companyIdx = headers.indexOf('Company');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const statusIdx = headers.indexOf('Status');
  const websiteIdx = headers.indexOf('Website');

  console.log(`\n=== ENRICHMENT RUN: ${new Date().toISOString()} ===\n`);
  console.log(`Headers found: ${headers.join(', ')}\n`);

  // Find leads needing enrichment
  const needsEnrichment = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    const website = row[websiteIdx] || '';

    // Skip if already enriched or no company
    if (!company || status === 'Enriched' || status === 'Sent' || status === 'Dead Lead') continue;

    // Needs enrichment if:
    // - No contact name
    // - No email or generic email
    const genericEmail = email.match(/^(info|sales|ir|investor|contact|admin|hello)@/i);
    
    if (!contact || !email || genericEmail) {
      needsEnrichment.push({
        row: i,
        company,
        contact,
        email,
        website,
        status,
      });
    }
  }

  console.log(`Found ${needsEnrichment.length} leads needing enrichment\n`);

  // Enrich up to 10-15 leads
  const toEnrich = needsEnrichment.slice(0, 15);
  const enrichmentResults = [];

  for (const lead of toEnrich) {
    console.log(`\n--- Enriching: ${lead.company} (Row ${lead.row + 1}) ---`);
    console.log(`Current contact: ${lead.contact || '(empty)'}`);
    console.log(`Current email: ${lead.email || '(empty)'}`);
    console.log(`Website: ${lead.website || '(empty)'}`);
    
    // Placeholder for web research (will be done manually via web_search)
    console.log(`\nAction needed: Research ${lead.company} for decision-maker contact`);
    
    enrichmentResults.push({
      row: lead.row,
      company: lead.company,
      needsResearch: true,
    });
  }

  console.log(`\n\n=== ENRICHMENT SUMMARY ===`);
  console.log(`Total needing enrichment: ${needsEnrichment.length}`);
  console.log(`Targeted this run: ${toEnrich.length}`);
  console.log(`\nLeads to research:`);
  toEnrich.forEach(lead => {
    console.log(`  - ${lead.company} (${lead.website || 'no website'})`);
  });

  // Return the firms to research
  return toEnrich;
}

main().catch(console.error);
