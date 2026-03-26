const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = path.join(__dirname, 'service-account.json');

async function getSheetClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function readSheet() {
  const sheets = await getSheetClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:N',
  });
  
  const rows = response.data.values || [];
  if (rows.length === 0) return [];
  
  const headers = rows[0];
  return rows.slice(1).map((row, index) => {
    const obj = { rowNumber: index + 2 };
    headers.forEach((header, i) => {
      obj[header] = row[i] || '';
    });
    return obj;
  });
}

async function findEnrichmentTargets(data) {
  return data.filter(row => {
    const status = (row.Status || '').toLowerCase().trim();
    const contactName = (row['Contact Name'] || '').trim();
    const email = (row.Email || '').trim().toLowerCase();
    const company = (row['PE Firm'] || '').trim();
    
    // Skip if already enriched or if there's no firm name
    if (!company || status === 'enriched' || status === 'sent' || status === 'dead') {
      return false;
    }
    
    // Need enrichment if:
    // 1. No contact name, OR
    // 2. Generic email (info@, sales@, ir@, contact@), OR
    // 3. Empty email
    const needsEnrichment = 
      !contactName ||
      !email ||
      email.startsWith('info@') ||
      email.startsWith('sales@') ||
      email.startsWith('ir@') ||
      email.startsWith('contact@');
    
    return needsEnrichment;
  });
}

async function updateSheet(updates) {
  if (updates.length === 0) return;
  
  const sheets = await getSheetClient();
  const requests = updates.map(update => ({
    range: `Sheet1!D${update.rowNumber}:G${update.rowNumber}`,
    values: [[
      update.contactName,
      update.title,
      update.email,
      update.linkedIn
    ]]
  }));
  
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { data: requests, valueInputOption: 'RAW' }
  });
}

async function updateStatus(rowNumber, status, notes = '') {
  const sheets = await getSheetClient();
  const values = notes ? [[status, notes]] : [[status]];
  const range = notes ? `Sheet1!H${rowNumber}:I${rowNumber}` : `Sheet1!H${rowNumber}`;
  
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range,
    valueInputOption: 'RAW',
    requestBody: { values }
  });
}

// Main enrichment run
async function run() {
  console.log('🔍 Reading Google Sheet...');
  const data = await readSheet();
  console.log(`📊 Total rows: ${data.length}`);
  
  const targets = await findEnrichmentTargets(data);
  console.log(`🎯 Targets needing enrichment: ${targets.length}`);
  
  if (targets.length === 0) {
    console.log('✅ No enrichment needed right now.');
    return;
  }
  
  // Take first 10-15 for this run
  const batch = targets.slice(0, 15);
  console.log(`\n🚀 Processing ${batch.length} firms:\n`);
  
  const enrichments = [];
  
  for (const target of batch) {
    console.log(`\n📍 ${target['PE Firm']}`);
    console.log(`   Current: ${target['Contact Name'] || '(empty)'} / ${target.Email || '(empty)'}`);
    console.log(`   → Searching for decision-maker...`);
    
    // TODO: Implement actual web search + LinkedIn search
    // For now, log the manual research task
    console.log(`   ⚠️  MANUAL RESEARCH NEEDED`);
    console.log(`      - Check firm website team page`);
    console.log(`      - Search: site:linkedin.com "${target['PE Firm']}" partner OR managing director`);
    console.log(`      - Look for press releases, conference bios`);
  }
  
  console.log(`\n✅ Enrichment scan complete.`);
  console.log(`📝 ${batch.length} firms flagged for manual research.`);
}

run().catch(console.error);
