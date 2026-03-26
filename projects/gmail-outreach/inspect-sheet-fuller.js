const { google } = require('googleapis');
const path = require('path');

async function inspectSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'service-account.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A:N'
  });
  
  const rows = response.data.values || [];
  
  console.log('📊 SHEET INSPECTION REPORT');
  console.log('='.repeat(80));
  console.log(`Total rows: ${rows.length - 1}`); // Exclude header
  console.log('');
  
  let totalFirms = 0;
  let hasContact = 0;
  let hasEmail = 0;
  let hasGenericEmail = 0;
  let enriched = 0;
  let dead = 0;
  
  const needsEnrichment = [];
  const hasPartialData = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const website = row[1] || '';
    const contact = row[2] || '';
    const title = row[3] || '';
    const email = row[4] || '';
    const status = (row[7] || '').toLowerCase();
    
    if (!company || company === 'Company Name') continue;
    
    totalFirms++;
    
    if (contact) hasContact++;
    if (email) hasEmail++;
    
    const isGeneric = email && (
      email.toLowerCase().includes('info@') ||
      email.toLowerCase().includes('sales@') ||
      email.toLowerCase().includes('ir@') ||
      email.toLowerCase().includes('contact@') ||
      email.toLowerCase().includes('inquiries@')
    );
    
    if (isGeneric) hasGenericEmail++;
    
    if (status.includes('enrich')) enriched++;
    if (status.includes('dead') || status.includes('closed')) dead++;
    
    // Identify enrichment needs
    if (!status.includes('dead') && !status.includes('closed')) {
      if (!contact || !email) {
        needsEnrichment.push({
          rowNum: i + 1,
          company,
          website,
          contact,
          email,
          status,
          issue: !contact ? 'Missing contact' : 'Missing email'
        });
      } else if (isGeneric) {
        hasPartialData.push({
          rowNum: i + 1,
          company,
          website,
          contact,
          email,
          status
        });
      }
    }
  }
  
  console.log('📈 Overall Statistics:');
  console.log(`  Total firms: ${totalFirms}`);
  console.log(`  With contact name: ${hasContact} (${Math.round(hasContact/totalFirms*100)}%)`);
  console.log(`  With email: ${hasEmail} (${Math.round(hasEmail/totalFirms*100)}%)`);
  console.log(`  Generic emails: ${hasGenericEmail}`);
  console.log(`  Marked "Enriched": ${enriched}`);
  console.log(`  Dead/Inactive: ${dead}`);
  console.log('');
  
  console.log(`🔴 MISSING DATA (${needsEnrichment.length} firms):`);
  needsEnrichment.slice(0, 15).forEach(lead => {
    console.log(`\n  Row ${lead.rowNum}: ${lead.company}`);
    console.log(`    Website: ${lead.website || '(none)'}`);
    console.log(`    Contact: ${lead.contact || '(missing)'}`);
    console.log(`    Email: ${lead.email || '(missing)'}`);
    console.log(`    Status: ${lead.status || '(none)'}`);
    console.log(`    Issue: ${lead.issue}`);
  });
  
  if (needsEnrichment.length > 15) {
    console.log(`\n  ... and ${needsEnrichment.length - 15} more with missing data`);
  }
  
  console.log(`\n\n🟡 GENERIC EMAILS (${hasPartialData.length} firms):`);
  hasPartialData.slice(0, 10).forEach(lead => {
    console.log(`\n  Row ${lead.rowNum}: ${lead.company}`);
    console.log(`    Contact: ${lead.contact}`);
    console.log(`    Email: ${lead.email} ⚠️ GENERIC`);
    console.log(`    Website: ${lead.website || '(none)'}`);
  });
  
  if (hasPartialData.length > 10) {
    console.log(`\n  ... and ${hasPartialData.length - 10} more with generic emails`);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`\n💡 RECOMMENDATION: Focus on ${needsEnrichment.length} firms with missing data first,`);
  console.log(`   then improve ${hasPartialData.length} firms with generic emails.`);
  
  return { needsEnrichment, hasPartialData };
}

inspectSheet().catch(console.error);
