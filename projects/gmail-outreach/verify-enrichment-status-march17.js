/**
 * Verify enrichment status - spot check
 */

const { google } = require('googleapis');
const path = require('path');

const CRM_SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

const GENERIC_PATTERNS = /^(info|contact|sales|ir|investor\.relations|investorrelations|hello|support|admin|general|inquiries)@/i;

async function verify() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: CRM_SHEET_ID,
    range: 'Sheet1!A:O',
  });
  
  const rows = res.data.values || [];
  
  console.log(`Total rows: ${rows.length}\n`);
  
  // Count status distribution
  const statusCounts = {};
  let emptyContacts = 0;
  let genericEmails = 0;
  let noEmails = 0;
  let noWebsites = 0;
  let fullyEnriched = 0;
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    
    const company = (row[0] || '').trim();
    const website = (row[1] || '').trim();
    const contact = (row[2] || '').trim();
    const email = (row[4] || '').trim();
    const status = (row[9] || '').trim();
    
    if (!company) continue;
    
    // Count statuses
    statusCounts[status] = (statusCounts[status] || 0) + 1;
    
    // Check enrichment issues
    if (!contact) emptyContacts++;
    if (!email) noEmails++;
    if (email && GENERIC_PATTERNS.test(email)) genericEmails++;
    if (!website) noWebsites++;
    if (contact && email && !GENERIC_PATTERNS.test(email) && website) fullyEnriched++;
  }
  
  console.log('📊 STATUS DISTRIBUTION:');
  Object.entries(statusCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([status, count]) => {
      console.log(`  ${status || '(empty)'}: ${count}`);
    });
  
  console.log(`\n📈 ENRICHMENT QUALITY:`);
  console.log(`  Fully enriched (contact + verified email + website): ${fullyEnriched}`);
  console.log(`  Missing contact name: ${emptyContacts}`);
  console.log(`  Missing email: ${noEmails}`);
  console.log(`  Generic emails: ${genericEmails}`);
  console.log(`  Missing website: ${noWebsites}`);
  
  // Find some specific examples needing work
  console.log(`\n🔍 SPOT CHECK - Random rows:`);
  const samples = [100, 300, 500, 700, 900, 1100, 1300];
  
  for (const i of samples) {
    if (i >= rows.length) continue;
    const row = rows[i];
    if (!row || row.length === 0) continue;
    
    console.log(`\nRow ${i + 1}:`);
    console.log(`  Company: ${row[0] || '(empty)'}`);
    console.log(`  Website: ${row[1] || '(empty)'}`);
    console.log(`  Contact: ${row[2] || '(EMPTY)'}`);
    console.log(`  Email: ${row[4] || '(EMPTY)'}`);
    console.log(`  Status: ${row[9] || '(empty)'}`);
  }
}

verify().catch(console.error);
