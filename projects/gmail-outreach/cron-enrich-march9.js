const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  console.log('🔍 PE ENRICHMENT CRON - March 9, 12:36 AM\n');
  
  try {
    // Read current sheet data
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    
    console.log('📥 Fetching current sheet data...');
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:N',
    });
    
    const rows = res.data.values;
    if (!rows || rows.length <= 1) {
      console.log('❌ No data found.');
      return;
    }
    
    // Save snapshot
    fs.writeFileSync('sheet-data.json', JSON.stringify(rows, null, 2));
    console.log(`✅ Fetched ${rows.length - 1} rows\n`);
    
    // Find leads needing enrichment
    const needsEnrichment = [];
    const headers = rows[0];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const firm = row[0] || '';
      const contact = row[1] || '';
      const title = row[2] || '';
      const email = row[3] || '';
      const status = row[8] || '';
      const notes = row[9] || '';
      
      // Skip Dead/Sent/Skipped
      if (status && (
        status.toLowerCase().includes('dead') || 
        status.toLowerCase() === 'sent' || 
        status.toLowerCase() === 'skipped'
      )) {
        continue;
      }
      
      // Check if needs enrichment
      const hasNoContact = !contact || contact.trim() === '';
      const hasGenericEmail = email && (
        email.toLowerCase().includes('info@') || 
        email.toLowerCase().includes('sales@') || 
        email.toLowerCase().includes('ir@') ||
        email.toLowerCase().includes('contact@')
      );
      const hasNoEmail = !email || email.trim() === '';
      
      if (hasNoContact || hasGenericEmail || hasNoEmail) {
        needsEnrichment.push({
          rowIndex: i,
          firm: firm,
          contact: contact,
          title: title,
          email: email,
          status: status,
          notes: notes,
          reason: hasNoContact ? 'No contact' : hasGenericEmail ? 'Generic email' : 'No email'
        });
      }
    }
    
    console.log(`\n🎯 ENRICHMENT TARGETS: ${needsEnrichment.length} firms\n`);
    
    if (needsEnrichment.length === 0) {
      console.log('✅ All active leads are enriched!');
      return;
    }
    
    // Save targets
    fs.writeFileSync('enrich-targets-march9.json', JSON.stringify(needsEnrichment, null, 2));
    
    // Display top 15 for manual research
    console.log('📋 TOP 15 PRIORITY TARGETS:\n');
    needsEnrichment.slice(0, 15).forEach((lead, idx) => {
      console.log(`${idx + 1}. ${lead.firm}`);
      console.log(`   Reason: ${lead.reason}`);
      console.log(`   Current: ${lead.contact || '(none)'} | ${lead.email || '(none)'}`);
      console.log('');
    });
    
    console.log('\n📝 NEXT STEPS:');
    console.log('1. Manually research contacts for these firms');
    console.log('2. Search: firm website, LinkedIn, press releases, conference bios');
    console.log('3. Find: CEOs, CTOs, Partners, Directors, VPs');
    console.log('4. Verify emails from official sources only');
    console.log('5. Update sheet with findings\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

main().catch(console.error);
