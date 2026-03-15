const { google } = require('googleapis');
const fs = require('fs');

const SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  console.log('🔍 Analyzing "New - Unresearched" Leads - March 9, 3:36 AM\n');
  
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
    
    // Find "New - Unresearched" leads
    const unresearched = [];
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
      
      // Look for unresearched or new leads
      if (status && (
        status.toLowerCase().includes('unresearched') ||
        status.toLowerCase() === 'researched' ||
        status.toLowerCase().includes('research - needs')
      )) {
        const hasNoContact = !contact || contact.trim() === '';
        const hasNoEmail = !email || email.trim() === '';
        const hasGenericEmail = email && (
          email.toLowerCase().startsWith('info@') ||
          email.toLowerCase().startsWith('sales@') ||
          email.toLowerCase().startsWith('ir@') ||
          email.toLowerCase().startsWith('contact@') ||
          email.toLowerCase().startsWith('admin@')
        );
        
        unresearched.push({
          row: i + 1,
          rowIndex: i,
          firm,
          domain,
          contact,
          email,
          title,
          linkedin,
          website,
          sector,
          status,
          notes,
          needsEnrichment: hasNoContact || hasNoEmail || hasGenericEmail,
          issue: hasNoContact ? 'No contact' : (hasNoEmail ? 'No email' : (hasGenericEmail ? 'Generic email' : 'OK'))
        });
        
        if (hasNoContact || hasNoEmail || hasGenericEmail) {
          needsEnrichment.push(unresearched[unresearched.length - 1]);
        }
      }
    }
    
    console.log(`📊 Total "Unresearched/Research" status leads: ${unresearched.length}`);
    console.log(`   ${needsEnrichment.length} need enrichment (missing contact or email)\n`);
    
    if (needsEnrichment.length === 0) {
      console.log('✅ All unresearched leads already have contact info!');
      console.log('\nThese leads just need status updates from "New - Unresearched" to "Enriched"\n');
      
      // Show first 10
      unresearched.slice(0, 10).forEach((lead, idx) => {
        console.log(`${idx + 1}. ${lead.firm}`);
        console.log(`   Contact: ${lead.contact}`);
        console.log(`   Email: ${lead.email}`);
        console.log(`   Status: ${lead.status} → should be "Enriched"\n`);
      });
      
      return;
    }
    
    console.log('🎯 LEADS NEEDING ENRICHMENT:\n');
    needsEnrichment.slice(0, 15).forEach((lead, idx) => {
      console.log(`${idx + 1}. ${lead.firm} (Row ${lead.row})`);
      console.log(`   Domain: ${lead.domain || lead.website || '(no domain)'}`);
      console.log(`   Issue: ${lead.issue}`);
      console.log(`   Current: ${lead.contact || '(empty)'} / ${lead.email || '(empty)'}`);
      console.log(`   Status: ${lead.status}`);
      if (lead.notes) console.log(`   Notes: ${lead.notes.substring(0, 100)}`);
      console.log('');
    });
    
    fs.writeFileSync(
      'unresearched-needs-enrichment-march9.json',
      JSON.stringify(needsEnrichment, null, 2)
    );
    console.log(`✅ Saved ${needsEnrichment.length} leads to unresearched-needs-enrichment-march9.json\n`);
    
    console.log('📝 NEXT STEPS:');
    console.log(`1. Research ${Math.min(15, needsEnrichment.length)} unresearched firms`);
    console.log('2. Find decision-makers: Partners, Directors, C-suite');
    console.log('3. Get verified direct emails from published sources');
    console.log('4. Update sheet with findings');
    console.log('5. Change Status from "New - Unresearched" to "Enriched"\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
}

main();
