const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = 'service-account.json';

async function readSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:M',
  });
  
  const rows = response.data.values || [];
  if (rows.length === 0) {
    console.log('No data found.');
    return [];
  }
  
  const headers = rows[0];
  const data = rows.slice(1).map((row, index) => {
    const obj = { rowIndex: index + 2 };
    headers.forEach((header, i) => {
      obj[header] = row[i] || '';
    });
    return obj;
  });
  
  return data;
}

async function findLeadsNeedingEnrichment() {
  const data = await readSheet();
  
  // Find leads with empty Contact Name or generic/empty Email
  const needsEnrichment = data.filter(row => {
    const email = (row.Email || '').toLowerCase().trim();
    const contactName = (row['Contact Name'] || '').trim();
    const status = (row.Status || '').toLowerCase();
    
    // Skip if Dead or Sent
    if (status === 'dead' || status === 'sent' || status === 'replied') {
      return false;
    }
    
    // Needs enrichment if:
    // - No contact name OR
    // - No email OR
    // - Generic email (info@, sales@, ir@, contact@)
    const hasGenericEmail = email.startsWith('info@') || 
                           email.startsWith('sales@') || 
                           email.startsWith('ir@') ||
                           email.startsWith('contact@') ||
                           email === '';
    
    return !contactName || hasGenericEmail;
  });
  
  console.log(`\n📊 ENRICHMENT NEEDS ANALYSIS`);
  console.log(`Total leads: ${data.length}`);
  console.log(`Needs enrichment: ${needsEnrichment.length}`);
  console.log(`\nTop 15 targets for enrichment:`);
  
  const top15 = needsEnrichment.slice(0, 15);
  top15.forEach((lead, i) => {
    console.log(`\n${i + 1}. ${lead.Company}`);
    console.log(`   Website: ${lead.Website || 'N/A'}`);
    console.log(`   Contact: ${lead['Contact Name'] || 'MISSING'}`);
    console.log(`   Email: ${lead.Email || 'MISSING'}`);
    console.log(`   Status: ${lead.Status || 'N/A'}`);
  });
  
  // Save to JSON for processing
  fs.writeFileSync('enrich-targets-march7-106pm.json', JSON.stringify(top15, null, 2));
  console.log(`\n✅ Saved 15 targets to enrich-targets-march7-106pm.json`);
  
  return top15;
}

findLeadsNeedingEnrichment().catch(console.error);
