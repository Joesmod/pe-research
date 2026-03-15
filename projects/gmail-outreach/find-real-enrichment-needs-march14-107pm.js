const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:O',
  });

  const rows = result.data.values || [];
  
  console.log(`Total rows: ${rows.length}\n`);
  
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const website = row[1] || '';
    const contact = row[2] || '';
    const title = row[3] || '';
    const email = row[4] || '';
    const statusH = row[7] || '';
    const statusJ = row[9] || '';
    
    // Skip header row
    if (company === 'Company Name') continue;
    
    // Skip if no company
    if (!company || !website) continue;
    
    // Skip dead leads or contacted
    if (statusJ.includes('Dead') || statusJ.includes('DUPLICATE')) continue;
    
    // Skip if already contacted
    if (statusJ === 'Contacted') continue;
    
    // Check for enrichment needs:
    // 1. No contact name
    // 2. No email
    // 3. Generic email (info@, sales@, ir@, etc.)
    const noContact = !contact || !contact.match(/[A-Za-z]{2,}/);
    const noEmail = !email || !email.includes('@');
    const genericEmail = email && email.match(/^(info|sales|ir|investor|contact|admin|hello|support)@/i);
    
    if (noContact || noEmail || genericEmail) {
      needsEnrichment.push({
        row: i + 1,
        company,
        website,
        contact: contact || '(empty)',
        title: title || '(empty)',
        email: email || '(empty)',
        statusJ: statusJ || '(empty)',
        reason: noContact ? 'No contact name' : genericEmail ? 'Generic email' : 'No email',
      });
    }
  }
  
  console.log(`\n=== LEADS NEEDING ENRICHMENT ===`);
  console.log(`Found ${needsEnrichment.length} leads with missing/generic contact info\n`);
  
  // Show first 15
  const batch = needsEnrichment.slice(0, 15);
  
  batch.forEach((lead, idx) => {
    console.log(`${idx + 1}. Row ${lead.row}: ${lead.company}`);
    console.log(`   Website: ${lead.website}`);
    console.log(`   Contact: ${lead.contact}`);
    console.log(`   Title: ${lead.title}`);
    console.log(`   Email: ${lead.email}`);
    console.log(`   Status: ${lead.statusJ}`);
    console.log(`   Reason: ${lead.reason}`);
    console.log('');
  });
  
  console.log(`Total to enrich: ${needsEnrichment.length}`);
  console.log(`Showing first ${batch.length} for this run\n`);
  
  return batch;
}

main().catch(console.error);
