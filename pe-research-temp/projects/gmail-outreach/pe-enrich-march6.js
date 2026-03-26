const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = JSON.parse(fs.readFileSync('service-account.json'));

async function main() {
  const auth = new google.auth.GoogleAuth({
    credentials: SERVICE_ACCOUNT,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read all data
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:K'  // Try Sheet1 instead of "PE Prospects"
  });
  
  const rows = response.data.values || [];
  if (rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  // Parse headers
  const headers = rows[0];
  console.log('Headers:', headers);
  
  const firmIdx = headers.findIndex(h => h && (h.toLowerCase().includes('firm') || h.toLowerCase().includes('company')));
  const contactIdx = headers.findIndex(h => h && h.toLowerCase().includes('contact'));
  const emailIdx = headers.findIndex(h => h && h.toLowerCase().includes('email'));
  const statusIdx = headers.findIndex(h => h && h.toLowerCase().includes('status'));
  
  console.log(`Column indices: Firm=${firmIdx}, Contact=${contactIdx}, Email=${emailIdx}, Status=${statusIdx}`);
  
  // Sample first 10 rows to see what we're working with
  console.log('\n--- SAMPLE DATA (first 10 rows) ---');
  for (let i = 1; i < Math.min(11, rows.length); i++) {
    const row = rows[i];
    console.log(`Row ${i+1}: ${row[firmIdx]} | ${row[contactIdx]} | ${row[emailIdx]} | ${row[statusIdx]}`);
  }
  
  // Find leads needing enrichment - scan ALL rows
  const targets = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const firm = row[firmIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    
    if (!firm.trim()) continue;
    
    // Skip if already enriched, sent, or dead
    const statusLower = status.toLowerCase();
    if (statusLower.includes('enriched') ||
        statusLower.includes('sent') ||
        statusLower.includes('dead')) {
      continue;
    }
    
    // Check if needs enrichment
    const isGenericEmail = /^(info@|sales@|ir@|investor|contact@|hello@)/i.test(email);
    const needsEnrichment = !contact.trim() || !email.trim() || isGenericEmail;
    
    if (needsEnrichment) {
      targets.push({
        rowIndex: i + 1,  // 1-indexed for sheet
        firm,
        contact: contact || '(empty)',
        email: email || '(empty)',
        status: status || '(empty)',
        needsContact: !contact.trim(),
        needsEmail: !email.trim() || isGenericEmail
      });
    }
  }
  
  console.log(`Scanned ${rows.length - 1} rows total.`);
  
  console.log(`\n\nFOUND ${targets.length} LEADS NEEDING ENRICHMENT\n`);
  
  // Take first 15
  const workList = targets.slice(0, 15);
  
  workList.forEach((t, idx) => {
    console.log(`${idx + 1}. ${t.firm} (Row ${t.rowIndex})`);
    console.log(`   Current: ${t.contact} / ${t.email}`);
    console.log(`   Needs: ${t.needsContact ? 'Contact' : ''} ${t.needsEmail ? 'Email' : ''}`);
    console.log();
  });
  
  fs.writeFileSync('pe-enrich-targets-march6.json', JSON.stringify(workList, null, 2));
  console.log(`Saved ${workList.length} targets to pe-enrich-targets-march6.json`);
}

main().catch(console.error);
