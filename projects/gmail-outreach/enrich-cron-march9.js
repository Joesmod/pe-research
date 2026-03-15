const { google } = require('googleapis');
const fs = require('fs');

async function main() {
  try {
    // Setup Google Sheets API
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
    
    // Read the sheet
    console.log('📊 Reading Google Sheet...');
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A:J',
    });
    
    const rows = res.data.values;
    if (!rows || rows.length === 0) {
      console.log('❌ No data found in sheet');
      return;
    }
    
    console.log(`✓ Found ${rows.length} rows`);
    
    // Parse header
    const header = rows[0];
    const companyIdx = header.findIndex(h => h && h.toLowerCase().includes('company'));
    const contactIdx = header.findIndex(h => h && h.toLowerCase().includes('contact'));
    const emailIdx = header.findIndex(h => h && h.toLowerCase().includes('email'));
    const statusIdx = header.findIndex(h => h && h.toLowerCase().includes('status'));
    const websiteIdx = header.findIndex(h => h && h.toLowerCase().includes('website') || h.toLowerCase().includes('notebook'));
    
    console.log(`\nColumn indices: Company=${companyIdx}, Contact=${contactIdx}, Email=${emailIdx}, Status=${statusIdx}`);
    
    // Find rows needing enrichment
    const needsEnrichment = [];
    const genericEmails = ['info@', 'contact@', 'sales@', 'ir@', 'hello@', 'support@', 'admin@'];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;
      
      const company = row[companyIdx] || '';
      const contact = row[contactIdx] || '';
      const email = row[emailIdx] || '';
      const status = row[statusIdx] || '';
      const website = row[websiteIdx] || '';
      
      // Skip if already enriched or dead
      if (status && (status.includes('Dead') || status.includes('Enriched'))) continue;
      
      // Check if needs enrichment
      const hasEmptyContact = !contact || contact.trim() === '';
      const hasGenericEmail = email && genericEmails.some(g => email.toLowerCase().includes(g));
      const hasEmptyEmail = !email || email.trim() === '';
      
      if (hasEmptyContact || hasGenericEmail || hasEmptyEmail) {
        needsEnrichment.push({
          rowIndex: i + 1, // +1 for Excel row number
          company,
          contact,
          email,
          website,
          status,
          reason: hasEmptyContact ? 'Empty Contact' : (hasGenericEmail ? 'Generic Email' : 'Empty Email')
        });
      }
    }
    
    console.log(`\n🎯 Found ${needsEnrichment.length} leads needing enrichment\n`);
    
    // Take first 15
    const targets = needsEnrichment.slice(0, 15);
    
    // Save to file for OpenClaw to process
    fs.writeFileSync('enrich-targets-march9.json', JSON.stringify(targets, null, 2));
    console.log(`✓ Saved ${targets.length} targets to enrich-targets-march9.json`);
    
    // Output summary
    console.log('\n📋 Enrichment Targets:\n');
    targets.forEach((t, idx) => {
      console.log(`${idx + 1}. Row ${t.rowIndex}: ${t.company}`);
      console.log(`   Reason: ${t.reason}`);
      console.log(`   Website: ${t.website || 'N/A'}`);
      console.log(`   Current Contact: ${t.contact || '(empty)'}`);
      console.log(`   Current Email: ${t.email || '(empty)'}`);
      console.log('');
    });
    
    console.log(`\n🚀 Ready for enrichment research on ${targets.length} firms`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
