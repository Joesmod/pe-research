const { google } = require('googleapis');
const fs = require('fs');

const SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  console.log('🫡 PE Research & Enrichment - Hourly Run - March 9, 7:36 AM\n');
  
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    
    console.log('📖 Reading current sheet state...');
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:K',
    });
    
    const rows = res.data.values;
    if (!rows || rows.length === 0) {
      console.log('❌ No data found.');
      return;
    }
    
    console.log(`✅ Found ${rows.length - 1} total rows\n`);
    
    // Find leads needing enrichment
    const needsEnrichment = [];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const firm = row[0] || '';
      const domain = row[1] || '';
      const contact = row[2] || '';
      const title = row[3] || '';
      const email = row[4] || '';
      const website = row[5] || '';
      const linkedin = row[6] || '';
      const sector = row[7] || '';
      const portfolio = row[8] || '';
      const status = row[9] || '';
      const notes = row[10] || '';
      
      // Skip if marked as Dead or Passed or already Sent
      if (status && (
        status.toLowerCase().includes('dead') ||
        status.toLowerCase().includes('passed') ||
        status.toLowerCase().includes('sent')
      )) {
        continue;
      }
      
      const hasNoContact = !contact || contact.trim() === '';
      const hasNoEmail = !email || email.trim() === '';
      const hasGenericEmail = email && (
        email.toLowerCase().startsWith('info@') ||
        email.toLowerCase().startsWith('sales@') ||
        email.toLowerCase().startsWith('ir@') ||
        email.toLowerCase().startsWith('contact@') ||
        email.toLowerCase().startsWith('admin@')
      );
      
      if (hasNoContact || hasNoEmail || hasGenericEmail) {
        needsEnrichment.push({
          row: i + 1,
          rowIndex: i,
          firm,
          domain: domain || website || '',
          contact,
          email,
          title,
          linkedin,
          website: website || domain || '',
          sector,
          status,
          notes,
          issue: hasNoContact ? 'No contact' : (hasNoEmail ? 'No email' : 'Generic email')
        });
      }
    }
    
    console.log(`🎯 Total leads needing enrichment: ${needsEnrichment.length}`);
    console.log(`   Selecting first 15 for research...\n`);
    
    if (needsEnrichment.length === 0) {
      console.log('✅ All leads have real contacts! Nothing to enrich.');
      console.log('HEARTBEAT_OK');
      return;
    }
    
    const targets = needsEnrichment.slice(0, 15);
    
    console.log('📋 ENRICHMENT TARGETS:\n');
    targets.forEach((lead, idx) => {
      console.log(`${idx + 1}. ${lead.firm} (Row ${lead.row})`);
      console.log(`   Domain: ${lead.domain || '(searching)'}`);
      console.log(`   Issue: ${lead.issue}`);
      console.log(`   Current Contact: ${lead.contact || '(empty)'}`);
      console.log(`   Current Email: ${lead.email || '(empty)'}`);
      console.log(`   Status: ${lead.status || '(empty)'}`);
      console.log('');
    });
    
    fs.writeFileSync(
      'enrich-needs-march9-736am.json',
      JSON.stringify(targets, null, 2)
    );
    
    console.log(`\n📝 PRIORITY: Enrich these ${targets.length} leads`);
    console.log('📦 Next steps:');
    console.log('1. Search for decision-makers at each firm');
    console.log('2. Find verified emails from official sources');
    console.log('3. Update sheet with findings');
    console.log('4. Commit findings to GitHub pe-research repo\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
}

main();
