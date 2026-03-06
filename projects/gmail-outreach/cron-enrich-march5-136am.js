const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read the sheet
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:K',
  });
  
  const rows = res.data.values || [];
  if (rows.length === 0) {
    console.log('No data found');
    return;
  }
  
  const headers = rows[0];
  console.log('Headers:', headers);
  console.log(`\nTotal rows: ${rows.length - 1}\n`);
  
  // Find columns
  const companyIdx = headers.indexOf('Company');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const statusIdx = headers.indexOf('Status');
  
  // Find rows needing enrichment
  const needsEnrichment = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    
    // Skip if already enriched or dead
    if (status === 'Enriched' || status === 'Dead' || status === 'Bounced') continue;
    
    // Needs enrichment if:
    // - No contact name
    // - No email or generic email
    const hasGenericEmail = email.match(/^(info|sales|ir|contact|admin|general)@/i);
    
    if (!contact || !email || hasGenericEmail) {
      needsEnrichment.push({
        rowIndex: i,
        company: company.trim(),
        contact,
        email,
        status
      });
    }
  }
  
  console.log(`Found ${needsEnrichment.length} firms needing enrichment\n`);
  
  // Show top 15
  const batch = needsEnrichment.slice(0, 15);
  batch.forEach((item, idx) => {
    console.log(`${idx + 1}. ${item.company}`);
    console.log(`   Row: ${item.rowIndex + 1} | Contact: ${item.contact || 'EMPTY'} | Email: ${item.email || 'EMPTY'} | Status: ${item.status}`);
  });
  
  // Save for manual enrichment
  fs.writeFileSync('enrichment-targets-march5-136am.json', JSON.stringify(batch, null, 2));
  console.log('\n✅ Targets saved to enrichment-targets-march5-136am.json');
}

main().catch(console.error);
