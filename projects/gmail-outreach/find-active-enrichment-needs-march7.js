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
  if (rows.length === 0) return [];
  
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

async function findActiveEnrichmentNeeds() {
  const data = await readSheet();
  
  // Find leads that:
  // 1. Are NOT Dead status
  // 2. Don't have "Enriched" or "Sent" status
  // 3. Have missing contact OR missing/generic email
  const needsEnrichment = data.filter(row => {
    const email = (row.Email || '').toLowerCase().trim();
    const contactName = (row['Contact Name'] || '').trim();
    const status = (row.Status || '').toLowerCase();
    const website = (row.Website || '').trim();
    
    // Skip if Dead, Sent, Enriched, Replied
    if (status.includes('dead') || status === 'sent' || status === 'enriched' || status === 'replied') {
      return false;
    }
    
    // Skip if no website (can't research)
    if (!website || website === 'N/A') {
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
  
  console.log(`\n📊 ACTIVE PE FIRMS NEEDING ENRICHMENT`);
  console.log(`Total leads: ${data.length}`);
  console.log(`Active needs enrichment: ${needsEnrichment.length}`);
  console.log(`\nNext 10 targets for research:\n`);
  
  const next10 = needsEnrichment.slice(0, 10);
  next10.forEach((lead, i) => {
    console.log(`${i + 1}. ${lead['Company Name'] || 'Unknown'}`);
    console.log(`   Website: ${lead.Website}`);
    console.log(`   Contact: ${lead['Contact Name'] || 'MISSING'}`);
    console.log(`   Email: ${lead.Email || 'MISSING'}`);
    console.log(`   Status: ${lead.Status || 'N/A'}\n`);
  });
  
  // Save to JSON
  fs.writeFileSync('active-enrichment-targets-march7-106pm.json', JSON.stringify(next10, null, 2));
  console.log(`✅ Saved 10 active targets to active-enrichment-targets-march7-106pm.json`);
  
  return next10;
}

findActiveEnrichmentNeeds().catch(console.error);
