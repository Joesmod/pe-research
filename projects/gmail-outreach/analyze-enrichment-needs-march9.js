const { google } = require('googleapis');
const fs = require('fs');

const SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  console.log('🔍 PE Sheet Analysis - March 9, 3:36 AM\n');
  
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    
    console.log('📖 Reading sheet data...');
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:K',
    });
    
    const rows = res.data.values;
    if (!rows || rows.length === 0) {
      console.log('❌ No data found.');
      return;
    }
    
    console.log(`📊 Total rows: ${rows.length - 1}\n`);
    
    // Analyze all status types
    const statusCounts = {};
    const needsEnrichment = [];
    const partialEnrichment = [];
    
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
      const status = row[9] || 'No Status';
      const notes = row[10] || '';
      
      // Count statuses
      statusCounts[status] = (statusCounts[status] || 0) + 1;
      
      // Skip if marked as done/dead
      if (status && (
        status.toLowerCase().includes('dead') ||
        status.toLowerCase() === 'sent' ||
        status.toLowerCase() === 'skipped' ||
        status.toLowerCase().includes('replied')
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
        email.toLowerCase().startsWith('admin@') ||
        email.toLowerCase().startsWith('hello@') ||
        email.toLowerCase().startsWith('support@')
      );
      
      // Truly needs enrichment: missing contact OR no/generic email
      if ((hasNoContact || hasNoEmail || hasGenericEmail) && domain && domain.startsWith('http')) {
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
          issue: hasNoContact ? 'No contact name' : (hasNoEmail ? 'No email' : 'Generic email')
        });
      }
      
      // Has contact but questionable email (not generic but might be wrong)
      if (contact && email && !hasGenericEmail && status.toLowerCase() === 'enriched') {
        // These might need verification
        if (!email.toLowerCase().includes(contact.toLowerCase().split(' ')[0].substring(0, 3))) {
          partialEnrichment.push({
            row: i + 1,
            firm,
            contact,
            email,
            notes: 'Email may not match contact name'
          });
        }
      }
    }
    
    console.log('📊 STATUS BREAKDOWN:\n');
    Object.entries(statusCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([status, count]) => {
        console.log(`   ${status}: ${count}`);
      });
    
    console.log(`\n\n🎯 LEADS NEEDING ENRICHMENT: ${needsEnrichment.length}\n`);
    
    if (needsEnrichment.length === 0) {
      console.log('✅ All active leads are properly enriched!');
      console.log('\nNext actions:');
      console.log('1. Add new PE firms to the sheet');
      console.log('2. Follow up on "Sent" status firms');
      console.log('3. Continue conversations with "Replied" firms\n');
      return;
    }
    
    // Show top enrichment needs
    console.log('Top needs:\n');
    needsEnrichment.slice(0, 15).forEach((lead, idx) => {
      console.log(`${idx + 1}. ${lead.firm} (Row ${lead.row})`);
      console.log(`   Domain: ${lead.domain}`);
      console.log(`   Issue: ${lead.issue}`);
      console.log(`   Current: ${lead.contact || '(empty)'} / ${lead.email || '(empty)'}`);
      console.log(`   Status: ${lead.status}`);
      if (lead.notes) console.log(`   Notes: ${lead.notes.substring(0, 100)}`);
      console.log('');
    });
    
    // Save for manual research
    fs.writeFileSync(
      'active-enrichment-needs.json',
      JSON.stringify(needsEnrichment, null, 2)
    );
    console.log(`✅ Saved ${needsEnrichment.length} leads to active-enrichment-needs.json\n`);
    
    // Summary
    console.log('📝 NEXT STEPS:');
    console.log(`1. Manual research for ${Math.min(15, needsEnrichment.length)} firms`);
    console.log('2. Search: website team pages, LinkedIn, press releases');
    console.log('3. Target roles: C-suite, Partners, Directors, VPs, Heads of...');
    console.log('4. Get VERIFIED direct emails from published sources');
    console.log('5. Update sheet + dossiers');
    console.log('6. Mark Status = "Enriched" when complete\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
}

main();
