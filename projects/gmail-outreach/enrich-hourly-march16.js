const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

async function main() {
  console.log('🔍 PE Hourly Enrichment - March 16, 5:37 AM');
  
  // Auth
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read Sheet1 data
  console.log('\n📊 Reading sheet data...');
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:M',
  });
  
  const rows = response.data.values || [];
  if (rows.length === 0) {
    console.log('❌ No data found');
    return;
  }
  
  const headers = rows[0];
  console.log('Headers:', headers);
  
  // Find column indices
  const companyIdx = headers.indexOf('Company / Firm');
  const contactIdx = headers.indexOf('Contact Name');
  const titleIdx = headers.indexOf('Position / Title');
  const emailIdx = headers.indexOf('Email');
  const statusIdx = headers.indexOf('Status');
  const websiteIdx = headers.indexOf('Website');
  const notesIdx = headers.indexOf('Notes');
  const linkedinIdx = headers.indexOf('LinkedIn URL');
  
  console.log(`\n📋 Column indices:
    Company: ${companyIdx}
    Contact Name: ${contactIdx}
    Email: ${emailIdx}
    Status: ${statusIdx}
    Website: ${websiteIdx}`);
  
  // Find leads needing enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contactName = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    const website = row[websiteIdx] || '';
    
    // Skip if status is Dead, Bounced, Sent, Replied
    if (['Dead', 'Bounced', 'Sent', 'Replied', 'Scheduled'].includes(status)) {
      continue;
    }
    
    // Check if needs enrichment
    const hasGenericEmail = email && (email.includes('info@') || email.includes('sales@') || email.includes('ir@') || email.includes('contact@'));
    const needsContact = !contactName || contactName.trim() === '';
    const needsRealEmail = !email || email.trim() === '' || hasGenericEmail;
    
    if (needsContact || needsRealEmail) {
      needsEnrichment.push({
        rowIndex: i + 1, // 1-indexed for Google Sheets
        company,
        website,
        contactName,
        email,
        status,
        needsContact,
        needsRealEmail,
        reason: needsContact ? 'Missing contact' : 'Generic/missing email'
      });
    }
  }
  
  console.log(`\n🎯 Found ${needsEnrichment.length} leads needing enrichment`);
  
  if (needsEnrichment.length === 0) {
    console.log('✅ All leads are enriched!');
    return;
  }
  
  // Show first 15
  const batch = needsEnrichment.slice(0, 15);
  console.log(`\n📝 Processing batch of ${batch.length}:\n`);
  
  batch.forEach((lead, idx) => {
    console.log(`${idx + 1}. ${lead.company} (Row ${lead.rowIndex})`);
    console.log(`   Current: ${lead.contactName || '(empty)'} / ${lead.email || '(empty)'}`);
    console.log(`   Website: ${lead.website || '(none)'}`);
    console.log(`   Reason: ${lead.reason}\n`);
  });
  
  console.log('\n💡 Next steps:');
  console.log('1. For each firm, search for decision-makers on:');
  console.log('   - Company website (About/Team/Leadership pages)');
  console.log('   - LinkedIn (site:linkedin.com queries)');
  console.log('   - Press releases, conference speaker bios');
  console.log('2. Look for: CEO, CTO, COO, Partners, VPs, Directors');
  console.log('3. Find verified direct emails (from official sources only)');
  console.log('4. Update sheet with Contact Name, Title, Email, LinkedIn URL');
  console.log('5. Set Status to "Enriched" when complete');
  
  console.log(`\n✅ Enrichment scan complete - ${batch.length} leads ready for research`);
}

main().catch(console.error);
