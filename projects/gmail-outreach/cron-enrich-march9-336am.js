const { google } = require('googleapis');
const fs = require('fs');

const SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  console.log('🔍 PE Research & Enrichment - March 9, 3:36 AM\n');
  
  try {
    // Authenticate
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Read current sheet data
    console.log('📖 Reading sheet data...');
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:K',  // Include Notes column
    });
    
    const rows = res.data.values;
    if (!rows || rows.length === 0) {
      console.log('❌ No data found.');
      return;
    }
    
    console.log(`📊 Total rows: ${rows.length - 1}\n`);
    
    // Find leads needing enrichment
    const needsEnrichment = [];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const firm = row[0] || '';
      const domain = row[1] || '';
      const contact = row[2] || '';
      const title = row[3] || '';
      const email = row[4] || '';
      const linkedin = row[6] || '';
      const status = row[9] || '';
      const notes = row[10] || '';
      
      // SKIP if Dead, Sent, or Skipped
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
        email.toLowerCase().includes('contact@') ||
        email.toLowerCase().includes('admin@') ||
        email.toLowerCase().includes('hello@') ||
        email.toLowerCase().includes('support@')
      );
      const hasNoEmail = !email || email.trim() === '';
      
      if (hasNoContact || hasGenericEmail || hasNoEmail) {
        needsEnrichment.push({
          row: i + 1,
          rowIndex: i,
          firm,
          domain,
          contact,
          email,
          title,
          linkedin,
          status,
          notes,
          issue: hasNoContact ? 'No contact' : (hasNoEmail ? 'No email' : 'Generic email')
        });
      }
    }
    
    console.log(`🎯 Found ${needsEnrichment.length} leads needing enrichment\n`);
    
    // Prioritize: real PE firms with domains
    const withDomains = needsEnrichment.filter(l => l.domain && l.domain.trim() && l.domain.startsWith('http'));
    console.log(`   ${withDomains.length} have valid domains (prioritize these)\n`);
    
    // Target top 10-15 with domains
    const targets = withDomains.slice(0, 15);
    
    console.log(`🎯 Targeting ${targets.length} firms for enrichment:\n`);
    targets.forEach((lead, idx) => {
      console.log(`${idx + 1}. ${lead.firm}`);
      console.log(`   Domain: ${lead.domain}`);
      console.log(`   Issue: ${lead.issue}`);
      console.log(`   Current: ${lead.contact || '(empty)'} / ${lead.email || '(empty)'}`);
      console.log('');
    });
    
    // Save snapshot for manual research
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 16);
    fs.writeFileSync(
      `enrich-targets-march9-${timestamp}.json`, 
      JSON.stringify(targets, null, 2)
    );
    
    console.log(`\n📝 NEXT STEPS:`);
    console.log(`1. Manual web research for these ${targets.length} firms`);
    console.log(`2. Find decision-makers: C-suite, Partners, Directors, VPs`);
    console.log(`3. Get verified direct emails from official sources`);
    console.log(`4. Update sheet with findings`);
    console.log(`5. Mark Status as "Enriched" when complete\n`);
    
    console.log(`✅ Targets saved to enrich-targets-march9-${timestamp}.json\n`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
