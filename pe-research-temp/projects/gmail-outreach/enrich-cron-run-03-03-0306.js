// PE Lead Enrichment - Cron Run 03-03-0306
// Target: Enrich 10-15 firms needing contacts/emails

const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = 'service-account.json';

async function main() {
  console.log('🫡 PE Enrichment Cron - 03:06 AM Run\n');
  
  // Initialize Google Sheets
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read current sheet
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:K',
  });
  
  const rows = result.data.values || [];
  if (rows.length < 2) {
    console.log('No data found.');
    return;
  }
  
  // Find enrichment targets
  const targets = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const firm = row[0] || '';
    const contact = row[1] || '';
    const email = row[3] || '';
    const status = row[8] || '';
    
    // Skip already enriched/sent/dead
    if (['Sent', 'Enriched', 'Responded', 'Bounced', 'Dead'].includes(status)) {
      continue;
    }
    
    // Need enrichment if: no contact OR generic email
    const needsEnrichment = (
      !contact || 
      contact.trim() === '' || 
      (email && ['info@', 'sales@', 'ir@', 'contact@', 'hello@', 'team@'].some(p => email.toLowerCase().startsWith(p)))
    );
    
    if (needsEnrichment && firm) {
      targets.push({
        rowIndex: i + 1,
        firm,
        contact,
        email,
        website: row[4] || '',
        linkedin: row[5] || '',
        status,
      });
    }
  }
  
  console.log(`Found ${targets.length} firms needing enrichment\n`);
  console.log('Top 15 targets:');
  targets.slice(0, 15).forEach((t, idx) => {
    console.log(`${idx + 1}. ${t.firm} (Row ${t.rowIndex})`);
    console.log(`   Contact: ${t.contact || '(empty)'}`);
    console.log(`   Email: ${t.email || '(empty)'}`);
    console.log(`   Status: ${t.status}\n`);
  });
  
  // Manual enrichment targets saved for web search
  const fs = require('fs');
  fs.writeFileSync(
    '_enrich_targets_0306.json',
    JSON.stringify(targets.slice(0, 15), null, 2)
  );
  
  console.log('\n✅ Saved 15 targets to _enrich_targets_0306.json');
  console.log('Next: Use web_search to find verified contacts\n');
}

main().catch(console.error);
