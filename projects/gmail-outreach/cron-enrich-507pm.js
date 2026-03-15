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
  
  const [date, company, position, contact, email, subject, status, notes, linkedIn, website, gumboScore] = row;
  
  if (!company || !company.trim()) return false;
  if (status === 'Dead' || status === 'Bounced') return false;
  
  const hasEmptyContact = !contact || contact.trim() === '';
  const hasGenericEmail = email && (
    email.includes('info@') || 
    email.includes('sales@') || 
    email.includes('ir@') ||
    email.includes('contact@') ||
    email.includes('hello@') ||
    email.includes('support@')
  );
  
  return hasEmptyContact || hasGenericEmail;
}

async function main() {
  console.log('=== PE ENRICHMENT CRON - 5:07 PM MARCH 7 ===\n');
  
  const rows = await readSheet();
  const headers = rows[0];
  
  console.log(`Read ${rows.length - 1} rows from sheet\n`);
  
  const targets = [];
  for (let i = 1; i < rows.length; i++) {
    if (needsEnrichment(rows[i], i)) {
      targets.push({
        row: i + 1,
        company: rows[i][1],
        website: rows[i][9] || '',
        contact: rows[i][3] || '',
        email: rows[i][4] || '',
        position: rows[i][2] || '',
      });
    }
  }
  
  console.log(`Found ${targets.length} leads needing enrichment:\n`);
  
  const enrichmentTargets = targets.slice(0, 15);
  enrichmentTargets.forEach((t, idx) => {
    console.log(`${idx + 1}. Row ${t.row}: ${t.company}`);
    console.log(`   Current: ${t.contact || '(empty)'} | ${t.email || '(empty)'}`);
    console.log(`   Website: ${t.website || '(none)'}\n`);
  });
  
  fs.writeFileSync(
    'enrich-targets-march7-507pm.json',
    JSON.stringify(enrichmentTargets, null, 2)
  );
  
  console.log(`\nTargets saved to enrich-targets-march7-507pm.json`);
  console.log(`\nNext: Manual web research for these ${enrichmentTargets.length} firms.`);
}

main().catch(console.error);
