const { google } = require('googleapis');
const key = require('./service-account.json');

const jwtClient = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  ['https://www.googleapis.com/auth/spreadsheets']
);

const sheets = google.sheets({ version: 'v4', auth: jwtClient });
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  console.log('=== PE Research & Enrichment - March 5, 4:06 AM ===\n');
  
  // Read current sheet data
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:J'
  });
  
  const rows = res.data.values;
  const headers = rows[0];
  
  // Find column indices
  const companyIdx = headers.indexOf('Company Name');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const titleIdx = headers.indexOf('Title');
  const statusIdx = headers.findIndex(h => h.includes('Status'));
  
  console.log(`Total rows: ${rows.length - 1}`);
  console.log(`Column indices: company=${companyIdx}, contact=${contactIdx}, email=${emailIdx}, title=${titleIdx}, status=${statusIdx}\n`);
  
  // Identify enrichment targets
  const targets = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !row[companyIdx]) continue;
    
    const company = row[companyIdx]?.trim();
    const contact = row[contactIdx]?.trim() || '';
    const email = row[emailIdx]?.trim() || '';
    const title = row[titleIdx]?.trim() || '';
    const status = row[statusIdx]?.trim() || '';
    
    // Skip if already sent or dead
    if (status && (status.includes('Sent') || status.includes('Dead') || status.includes('Bounce'))) {
      continue;
    }
    
    // Target: missing contact name OR generic/missing email
    const needsContact = !contact || contact.length < 3;
    const needsEmail = !email || 
                       email.includes('info@') || 
                       email.includes('sales@') || 
                       email.includes('ir@') || 
                       email.includes('contact@') ||
                       email.includes('hello@');
    
    if (needsContact || needsEmail) {
      targets.push({
        rowIndex: i + 1,
        company,
        contact,
        email,
        title,
        status,
        needsContact,
        needsEmail
      });
    }
  }
  
  console.log(`Found ${targets.length} leads needing enrichment`);
  console.log(`- Missing contact: ${targets.filter(t => t.needsContact).length}`);
  console.log(`- Generic/missing email: ${targets.filter(t => t.needsEmail).length}\n`);
  
  // Show first 15 targets
  console.log('=== Top 15 Enrichment Targets ===\n');
  targets.slice(0, 15).forEach((t, idx) => {
    console.log(`${idx + 1}. ${t.company} (Row ${t.rowIndex})`);
    console.log(`   Contact: ${t.contact || 'MISSING'}`);
    console.log(`   Email: ${t.email || 'MISSING'}`);
    console.log(`   Needs: ${[t.needsContact && 'contact', t.needsEmail && 'email'].filter(Boolean).join(', ')}`);
    console.log('');
  });
  
  // Save targets to file
  require('fs').writeFileSync(
    'enrichment-targets-march5-406am.json',
    JSON.stringify(targets, null, 2)
  );
  
  console.log(`\n✓ Saved ${targets.length} targets to enrichment-targets-march5-406am.json`);
}

main().catch(console.error);
