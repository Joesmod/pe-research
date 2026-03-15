const { google } = require('googleapis');
const key = require('./service-account.json');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function readSheet() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:M',
  });
  
  return response.data.values;
}

async function updateSheet(updates) {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  for (const update of updates) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: update.range,
      valueInputOption: 'RAW',
      resource: { values: [[update.value]] },
    });
  }
}

function needsEnrichment(row, index) {
  const [company, website, contactName, title, email, linkedIn, status] = row;
  
  // Skip header row
  if (index === 0) return false;
  
  // Skip if already enriched or dead
  if (status === 'Enriched' || status === 'Dead') return false;
  
  // Need enrichment if:
  // 1. No contact name
  // 2. No email or generic email (info@, sales@, ir@, contact@, hello@, support@)
  const genericPrefixes = ['info@', 'sales@', 'ir@', 'contact@', 'hello@', 'support@', 'admin@'];
  const hasGenericEmail = email && genericPrefixes.some(prefix => email.toLowerCase().startsWith(prefix));
  const noContactName = !contactName || contactName.trim() === '';
  const noEmail = !email || email.trim() === '';
  
  return noContactName || noEmail || hasGenericEmail;
}

async function enrichLead(company, website) {
  console.log(`\n🔍 Researching: ${company}`);
  console.log(`   Website: ${website}`);
  console.log(`   Searching for: C-level, Partners, Directors, VPs, Heads of ops...`);
  
  // This would be replaced with actual web research
  // For now, returning placeholder to show structure
  return {
    found: false,
    contactName: '',
    title: '',
    email: '',
    linkedIn: '',
    source: '',
    notes: 'Needs manual research'
  };
}

async function main() {
  console.log('📊 Reading Google Sheet...\n');
  const rows = await readSheet();
  
  console.log(`Total rows: ${rows.length}`);
  
  const needsEnrich = [];
  rows.forEach((row, index) => {
    if (needsEnrichment(row, index)) {
      needsEnrich.push({ row, index: index + 1 });
    }
  });
  
  console.log(`\n✅ Found ${needsEnrich.length} leads needing enrichment`);
  
  if (needsEnrich.length === 0) {
    console.log('\n✨ All leads are enriched! Nothing to do.');
    return;
  }
  
  // Take first 10-15
  const batch = needsEnrich.slice(0, 15);
  console.log(`\n🎯 Processing batch of ${batch.length} leads\n`);
  
  const results = [];
  const updates = [];
  
  for (const { row, index } of batch) {
    const [company, website] = row;
    
    const result = await enrichLead(company, website);
    results.push({ company, ...result });
    
    if (result.found) {
      // Prepare sheet updates
      updates.push(
        { range: `Sheet1!C${index}`, value: result.contactName },
        { range: `Sheet1!D${index}`, value: result.title },
        { range: `Sheet1!E${index}`, value: result.email },
        { range: `Sheet1!F${index}`, value: result.linkedIn },
        { range: `Sheet1!G${index}`, value: 'Enriched' },
        { range: `Sheet1!M${index}`, value: `Source: ${result.source}` }
      );
    } else {
      // Mark for manual research
      updates.push(
        { range: `Sheet1!M${index}`, value: result.notes }
      );
    }
  }
  
  console.log('\n📝 SUMMARY:');
  console.log(`   Total processed: ${batch.length}`);
  console.log(`   Found contacts: ${results.filter(r => r.found).length}`);
  console.log(`   Need manual work: ${results.filter(r => !r.found).length}`);
  
  if (updates.length > 0) {
    console.log(`\n💾 Updating Google Sheet (${updates.length} cells)...`);
    await updateSheet(updates);
    console.log('✅ Sheet updated');
  }
  
  // Save results log
  const logPath = './enrich-results-march9-836pm.json';
  fs.writeFileSync(logPath, JSON.stringify(results, null, 2));
  console.log(`\n📁 Results saved to ${logPath}`);
  
  console.log('\n✨ Enrichment complete!');
  console.log('\nNEXT STEPS:');
  console.log('1. Review leads marked "Needs manual research"');
  console.log('2. Search company websites, LinkedIn, press releases for contacts');
  console.log('3. Update sheet manually with findings');
  console.log('4. Commit dossier updates to GitHub');
}

main().catch(console.error);
