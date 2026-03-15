const { google } = require('googleapis');
const fs = require('fs');

const SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function readSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Sheet1!A:K',
  });
  
  return response.data.values;
}

function needsEnrichment(row, index) {
  if (index === 0) return false; // Skip header
  
  const company = row[0] || '';
  const notebookLM = row[1] || '';
  const contact = row[2] || '';
  const title = row[3] || '';
  const email = row[4] || '';
  const website = row[5] || '';
  const linkedin = row[6] || '';
  const sector = row[7] || '';
  const portfolio = row[8] || '';
  const status = row[9] || '';
  const lastContacted = row[10] || '';
  
  if (!company || !company.trim()) return false;
  
  // Skip dead/bounced leads
  if (status === 'Dead' || status === 'Bounced') return false;
  
  // Skip already enriched
  if (status.includes('Enriched')) return false;
  
  // Need enrichment if:
  // 1. Contact name is empty
  const hasEmptyContact = !contact || contact.trim() === '';
  
  // 2. Email is empty or generic
  const hasGenericEmail = !email || email.includes('info@') || 
    email.includes('sales@') || 
    email.includes('ir@') ||
    email.includes('contact@') ||
    email.includes('hello@') ||
    email.includes('support@');
  
  return hasEmptyContact || hasGenericEmail;
}

async function main() {
  console.log('=== PE ENRICHMENT CRON - 5:07 PM MARCH 7 ===\n');
  
  const rows = await readSheet();
  const headers = rows[0];
  
  console.log(`Headers: ${headers.join(' | ')}\n`);
  console.log(`Read ${rows.length - 1} rows from sheet\n`);
  
  const targets = [];
  for (let i = 1; i < rows.length; i++) {
    if (needsEnrichment(rows[i], i)) {
      targets.push({
        row: i + 1,
        company: rows[i][0],
        notebookLM: rows[i][1] || '',
        contact: rows[i][2] || '',
        title: rows[i][3] || '',
        email: rows[i][4] || '',
        website: rows[i][5] || '',
        linkedin: rows[i][6] || '',
        status: rows[i][9] || '',
      });
    }
  }
  
  console.log(`Found ${targets.length} leads needing enrichment\n`);
  
  const enrichmentTargets = targets.slice(0, 15);
  enrichmentTargets.forEach((t, idx) => {
    console.log(`${idx + 1}. Row ${t.row}: ${t.company}`);
    console.log(`   Current Contact: ${t.contact || '(empty)'}`);
    console.log(`   Current Email: ${t.email || '(empty)'}`);
    console.log(`   Website: ${t.website || '(none)'}`);
    console.log(`   Status: ${t.status || '(none)'}\n`);
  });
  
  fs.writeFileSync(
    'enrich-targets-march7-507pm.json',
    JSON.stringify(enrichmentTargets, null, 2)
  );
  
  console.log(`\nTargets saved to enrich-targets-march7-507pm.json`);
  console.log(`\nNext: Web research for these ${enrichmentTargets.length} firms.`);
}

main().catch(console.error);
