const { google } = require('googleapis');
const path = require('path');
const fs = require('fs').promises;

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = path.join(__dirname, 'service-account.json');
const RESULTS_FILE = 'enrichment-results-march16-437pm.json';

async function getSheetClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function readContacts() {
  const sheets = await getSheetClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Contacts!A:I',
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

function needsEnrichment(contact) {
  const company = contact.Company?.trim();
  const contactName = contact['Contact Name']?.trim();
  const email = contact.Email?.trim().toLowerCase();
  const emailStatus = contact['Email Status']?.toLowerCase().trim();
  
  // Skip if no company
  if (!company) return false;
  
  // Skip if already marked as unreachable or dead
  if (emailStatus?.includes('dead') || emailStatus?.includes('unreachable')) {
    return false;
  }
  
  // Need enrichment if:
  // 1. No contact name
  // 2. No email
  // 3. Generic/unverified email
  const isGeneric = email?.startsWith('info@') || 
                   email?.startsWith('sales@') || 
                   email?.startsWith('ir@') || 
                   email?.startsWith('contact@') ||
                   email?.startsWith('invest@');
  
  return !contactName || !email || isGeneric;
}

async function searchForContact(company) {
  // This is where we'd implement web search, LinkedIn search, etc.
  // For now, return manual research task
  return {
    needsManualResearch: true,
    searchStrategies: [
      `site:${company.toLowerCase().replace(/\s+/g, '')}.com team`,
      `site:linkedin.com "${company}" managing director OR partner OR CEO`,
      `"${company}" press release executive`,
      `${company} SEC filings`,
    ]
  };
}

async function run() {
  console.log('🔍 PE Research & Enrichment - Hourly Run');
  console.log('📅 Monday, March 16th, 2026 - 4:37 PM CST\n');
  
  console.log('📊 Reading Contacts tab...');
  const contacts = await readContacts();
  console.log(`   Total contacts: ${contacts.length}`);
  
  const targets = contacts.filter(needsEnrichment);
  console.log(`   Need enrichment: ${targets.length}\n`);
  
  if (targets.length === 0) {
    console.log('✅ All leads enriched! No work needed.');
    return;
  }
  
  // Take first 15 for this run
  const batch = targets.slice(0, 15);
  console.log(`🚀 Processing ${batch.length} firms:\n`);
  
  const results = [];
  
  for (const [idx, target] of batch.entries()) {
    console.log(`${idx + 1}. ${target.Company}`);
    console.log(`   Row ${target.rowNumber}`);
    console.log(`   Current: ${target['Contact Name'] || '(empty)'} / ${target.Email || '(empty)'}`);
    
    const research = await searchForContact(target.Company);
    
    if (research.needsManualResearch) {
      console.log(`   ⚠️  MANUAL RESEARCH NEEDED`);
      console.log(`   Search strategies:`);
      research.searchStrategies.forEach(s => console.log(`      - ${s}`));
      
      results.push({
        company: target.Company,
        rowNumber: target.rowNumber,
        status: 'needs_manual_research',
        searches: research.searchStrategies
      });
    }
    
    console.log('');
  }
  
  // Save results
  await fs.writeFile(RESULTS_FILE, JSON.stringify(results, null, 2));
  
  console.log('✅ Enrichment scan complete.');
  console.log(`📝 ${batch.length} firms flagged for manual research.`);
  console.log(`💾 Results saved to ${RESULTS_FILE}\n`);
  
  console.log('📋 Summary:');
  console.log(`   Total contacts: ${contacts.length}`);
  console.log(`   Need enrichment: ${targets.length}`);
  console.log(`   Processed this run: ${batch.length}`);
  console.log(`   Remaining: ${targets.length - batch.length}`);
}

run().catch(console.error);
