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
  
  // Find columns (Company Name is column A, index 0)
  const companyIdx = 0; // Company Name
  const contactIdx = 2;  // Contact Name
  const emailIdx = 4;    // Email
  const websiteIdx = 5;  // Website
  const statusIdx = 9;   // Status
  
  // Find rows needing enrichment
  const needsEnrichment = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = (row[companyIdx] || '').trim();
    const contact = (row[contactIdx] || '').trim();
    const email = (row[emailIdx] || '').trim();
    const website = (row[websiteIdx] || '').trim();
    const status = (row[statusIdx] || '').trim();
    
    // Skip if no company name
    if (!company) continue;
    
    // Skip if already enriched, dead, or bounced
    if (status === 'Enriched' || status === 'Dead' || status === 'Bounced' || status === 'Dead Lead') continue;
    
    // Needs enrichment if:
    // - No contact name
    // - No email or generic email
    const hasGenericEmail = email && email.match(/^(info|sales|ir|contact|admin|general)@/i);
    
    if (!contact || !email || hasGenericEmail) {
      needsEnrichment.push({
        rowIndex: i,
        company,
        contact,
        email,
        website,
        status
      });
    }
  }
  
  console.log(`Found ${needsEnrichment.length} firms needing enrichment\n`);
  
  // Show top 15
  const batch = needsEnrichment.slice(0, 15);
  batch.forEach((item, idx) => {
    console.log(`${idx + 1}. ${item.company}`);
    console.log(`   Row: ${item.rowIndex + 1} | Contact: ${item.contact || 'EMPTY'} | Email: ${item.email || 'EMPTY'}`);
    console.log(`   Website: ${item.website || 'EMPTY'} | Status: ${item.status}\n`);
  });
  
  // Save for manual enrichment
  fs.writeFileSync('enrichment-targets-march5-136am-v2.json', JSON.stringify(batch, null, 2));
  console.log('✅ Targets saved to enrichment-targets-march5-136am-v2.json');
}

main().catch(console.error);
