/**
 * Hourly PE Enrichment Scan
 * Find firms with empty contacts or generic emails in Sheet1
 */

const { google } = require('googleapis');
const path = require('path');

const CRM_SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function scanForEnrichment() {
  const sheets = await getSheets();
  
  // Read Sheet1
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: CRM_SHEET_ID,
    range: 'Sheet1!A:P',
  });
  
  const rows = res.data.values || [];
  if (rows.length === 0) {
    console.log('No data found in Sheet1');
    return [];
  }
  
  const headers = rows[0];
  console.log('Headers:', headers.join(' | '));
  
  // Find column indices
  const companyIdx = headers.findIndex(h => /company|firm/i.test(h));
  const nameIdx = headers.findIndex(h => /contact.*name|name/i.test(h) && !/company/i.test(h));
  const titleIdx = headers.findIndex(h => /title|position/i.test(h));
  const emailIdx = headers.findIndex(h => /email|contact/i.test(h) && !/company/i.test(h));
  const websiteIdx = headers.findIndex(h => /website|url|domain/i.test(h));
  const statusIdx = headers.findIndex(h => /status/i.test(h));
  const aumIdx = headers.findIndex(h => /aum|assets/i.test(h));
  
  console.log(`\nColumn indices:
  Company: ${companyIdx}
  Name: ${nameIdx}
  Title: ${titleIdx}
  Email: ${emailIdx}
  Website: ${websiteIdx}
  Status: ${statusIdx}
  AUM: ${aumIdx}`);
  
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    
    const company = row[companyIdx] || '';
    const name = row[nameIdx] || '';
    const title = row[titleIdx] || '';
    const email = row[emailIdx] || '';
    const website = row[websiteIdx] || '';
    const status = row[statusIdx] || '';
    const aum = row[aumIdx] || '';
    
    if (!company) continue;
    
    // Skip if marked Dead/Not Qualified
    if (/dead|not qualified|no ai|no tech/i.test(status)) continue;
    
    // Check if needs enrichment
    const needsContact = !name || name.trim() === '';
    const genericEmail = /^(info@|contact@|sales@|ir@|hello@|team@)/i.test(email);
    const noEmail = !email || email.trim() === '';
    
    if (needsContact || genericEmail || noEmail) {
      needsEnrichment.push({
        rowIndex: i + 1, // 1-indexed for sheet
        company,
        name,
        title,
        email,
        website,
        status,
        aum,
        reason: needsContact ? 'No contact' : (noEmail ? 'No email' : 'Generic email')
      });
    }
  }
  
  console.log(`\n✅ Found ${needsEnrichment.length} firms needing enrichment\n`);
  
  // Group by reason
  const byReason = {
    'No contact': needsEnrichment.filter(f => f.reason === 'No contact'),
    'No email': needsEnrichment.filter(f => f.reason === 'No email'),
    'Generic email': needsEnrichment.filter(f => f.reason === 'Generic email')
  };
  
  for (const [reason, firms] of Object.entries(byReason)) {
    console.log(`\n${reason}: ${firms.length} firms`);
    firms.slice(0, 5).forEach(f => {
      console.log(`  Row ${f.rowIndex}: ${f.company} (${f.website})`);
    });
  }
  
  // Return top 15 priority targets (firms with websites, in active status)
  const priority = needsEnrichment
    .filter(f => f.website && !/dead|not qualified/i.test(f.status))
    .slice(0, 15);
  
  console.log(`\n🎯 Top 15 priority targets for enrichment:\n`);
  priority.forEach((f, i) => {
    console.log(`${i + 1}. Row ${f.rowIndex}: ${f.company} — ${f.reason} — ${f.website}`);
  });
  
  return priority;
}

scanForEnrichment().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
