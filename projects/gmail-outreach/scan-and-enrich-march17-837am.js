const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = require('./service-account.json');

const GENERIC_EMAILS = ['info', 'sales', 'ir', 'contact', 'support', 'hello', 'admin', 'hello'];

async function readSheet() {
  const auth = new google.auth.GoogleAuth({
    credentials: SERVICE_ACCOUNT,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A2:N',
  });

  return response.data.values || [];
}

function needsEnrichment(row) {
  const companyName = row[0] || '';
  const contactName = row[2] || '';
  const email = row[4] || '';
  const status = row[7] || '';
  const statusCol2 = row[9] || '';
  
  // Skip dead/sent/not relevant
  if (['Dead', 'Not Relevant', 'Sent'].some(s => 
    status.includes(s) || statusCol2.includes(s))) {
    return false;
  }
  
  // Check if needs enrichment
  const noContact = !contactName || contactName.trim() === '';
  const hasGenericEmail = email && GENERIC_EMAILS.some(prefix => 
    email.toLowerCase().startsWith(prefix + '@'));
  const needsEmail = status.includes('Needs Email');
  
  return (noContact || hasGenericEmail || needsEmail) && companyName;
}

async function main() {
  console.log('📊 Scanning Google Sheet for enrichment candidates...\n');
  
  const rows = await readSheet();
  const candidates = [];
  
  rows.forEach((row, idx) => {
    if (needsEnrichment(row)) {
      candidates.push({
        rowIndex: idx + 2, // +2 because we start at A2
        company: row[0] || '',
        website: row[1] || '',
        contactName: row[2] || '',
        title: row[3] || '',
        email: row[4] || '',
        status: row[7] || '',
        notes: row[8] || '',
      });
    }
  });
  
  console.log(`Found ${candidates.length} leads needing enrichment\n`);
  
  // Take first 15
  const batch = candidates.slice(0, 15);
  
  console.log('Top 15 candidates for enrichment:');
  batch.forEach((c, i) => {
    console.log(`${i + 1}. ${c.company} (Row ${c.rowIndex})`);
    console.log(`   Contact: ${c.contactName || 'EMPTY'}`);
    console.log(`   Email: ${c.email || 'EMPTY'}`);
    console.log(`   Status: ${c.status}`);
    console.log('');
  });
  
  fs.writeFileSync('enrichment-candidates-march17-837am.json', JSON.stringify(batch, null, 2));
  console.log(`✅ Saved ${batch.length} candidates to enrichment-candidates-march17-837am.json`);
}

main().catch(console.error);
