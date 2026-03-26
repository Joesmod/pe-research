const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read ALL rows
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A2:P',
  });
  
  const rows = response.data.values || [];
  console.log(`Scanning ${rows.length} rows...\n`);
  
  const needsEnrichment = [];
  const statusCounts = {};
  
  rows.forEach((row, i) => {
    const company = (row[0] || '').trim();
    const domain = (row[1] || '').trim();
    const contactName = (row[2] || '').trim();
    const title = (row[3] || '').trim();
    const email = (row[4] || '').trim();
    const status = (row[9] || '').trim();
    
    if (!company) return;
    
    statusCounts[status] = (statusCounts[status] || 0) + 1;
    
    // Find ALL rows that could use better contact info
    const hasGenericEmail = email && (
      email.toLowerCase().startsWith('info@') ||
      email.toLowerCase().startsWith('sales@') ||
      email.toLowerCase().startsWith('ir@') ||
      email.toLowerCase().startsWith('contact@') ||
      email.toLowerCase().startsWith('hello@')
    );
    
    const needsWork = (
      !contactName ||
      !email ||
      hasGenericEmail ||
      status === 'Needs Email' ||
      status === 'Researched' // Has company but no verified direct contact
    );
    
    if (needsWork) {
      needsEnrichment.push({
        rowIndex: i + 2,
        company,
        domain,
        contactName: contactName || '(empty)',
        title: title || '',
        email: email || '(empty)',
        status: status || '(empty)',
        priority: !email ? 'HIGH' : hasGenericEmail ? 'MEDIUM' : 'LOW'
      });
    }
  });
  
  console.log(`\nTotal needing enrichment: ${needsEnrichment.length}`);
  console.log('\nStatus breakdown (all rows):');
  Object.entries(statusCounts).sort((a, b) => b[1] - a[1]).slice(0, 15).forEach(([status, count]) => {
    console.log(`  ${status || '(empty)'}: ${count}`);
  });
  
  // Sort by priority
  needsEnrichment.sort((a, b) => {
    const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  console.log(`\n\n=== TOP 15 PRIORITY TARGETS ===\n`);
  needsEnrichment.slice(0, 15).forEach((lead, i) => {
    console.log(`${i + 1}. [${lead.priority}] ${lead.company}`);
    console.log(`   Domain: ${lead.domain || '(none)'}`);
    console.log(`   Contact: ${lead.contactName} | ${lead.title}`);
    console.log(`   Email: ${lead.email}`);
    console.log(`   Status: ${lead.status}`);
    console.log('');
  });
  
  fs.writeFileSync(
    path.join(__dirname, 'enrichment-queue-full.json'),
    JSON.stringify(needsEnrichment, null, 2)
  );
  
  console.log(`\nSaved ${needsEnrichment.length} targets to enrichment-queue-full.json`);
}

main().catch(console.error);
