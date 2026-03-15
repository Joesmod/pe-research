const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

async function main() {
  console.log('🫡 PE Research & Enrichment - Hourly Run');
  console.log('Time:', new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }));
  
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  // Read all of Sheet1
  console.log('\n[1/4] Reading Google Sheet...');
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:N',
  });

  const rows = response.data.values || [];
  console.log(`Total rows: ${rows.length}`);
  
  // Row 0 structure from analysis:
  // A: Company Name
  // B: NotebookLM
  // C: Contact Name
  // D: Position/Title
  // E: Email
  // F: Company website (or misc)
  // G: LinkedIn URL
  // H: Status (misc)
  // I: Notes
  // J: Status (actual)
  // K: Last Contacted
  // L: Notes
  // M: Company Info URL
  // N: Gumbo Score
  
  console.log('\n[2/4] Identifying leads needing enrichment...');
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {  // Skip header row 0
    const row = rows[i];
    if (!row || row.length === 0) continue;
    
    const company = row[0] || '';
    const contactName = row[2] || '';
    const email = row[4] || '';
    const status = row[9] || '';  // Column J
    
    // Skip if no company name
    if (!company.trim()) continue;
    
    // Skip if Dead/Bounced
    if (status === 'Dead' || status === 'Bounced') continue;
    
    // Check if needs enrichment
    const hasValidContact = contactName.trim() !== '';
    const hasValidEmail = email.trim() !== '' && 
                          !email.includes('info@') && 
                          !email.includes('sales@') && 
                          !email.includes('ir@') &&
                          !email.includes('contact@');
    
    if (!hasValidContact || !hasValidEmail) {
      needsEnrichment.push({
        rowIndex: i + 1,  // Sheet rows are 1-indexed
        company,
        contactName,
        email,
        status,
        website: row[1] || '',  // NotebookLM column often has website
      });
    }
  }
  
  console.log(`Found ${needsEnrichment.length} firms needing enrichment`);
  
  if (needsEnrichment.length === 0) {
    console.log('\n✅ All leads are enriched!');
    return;
  }
  
  // Select top 10-15
  const targetCount = Math.min(15, needsEnrichment.length);
  const targets = needsEnrichment.slice(0, targetCount);
  
  console.log(`\nTargeting ${targets.length} firms:`);
  targets.forEach((t, idx) => {
    console.log(`  ${idx + 1}. ${t.company} (Row ${t.rowIndex})`);
  });
  
  // Save targets
  const targetFile = path.join(__dirname, 'enrichment-targets-march15-run.json');
  fs.writeFileSync(targetFile, JSON.stringify(targets, null, 2));
  console.log(`\nTargets saved to: ${targetFile}`);
  
  console.log('\n[3/4] Starting enrichment research...');
  console.log('This is a RESEARCH ONLY run. No emails will be sent.');
  console.log('\nFor each firm, I will search for verified contacts.');
  
  // TODO: Implement actual web_search + web_fetch enrichment here
  // For now, just output the instructions
  
  console.log('\n[4/4] Summary');
  console.log(`Total firms needing enrichment: ${needsEnrichment.length}`);
  console.log(`Targets selected for this run: ${targets.length}`);
  console.log(`\nNext: Implement web research automation or manual enrichment`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
