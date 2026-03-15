const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function inspectSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:J'
  });
  
  const rows = res.data.values;
  console.log('\n📊 SHEET STRUCTURE\n');
  console.log('Headers:', rows[0]);
  console.log('\n');
  
  // Find rows that need enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const firm = row[0] || '';
    const website = row[1] || '';
    const contactName = row[2] || '';
    const title = row[3] || '';
    const email = row[4] || '';
    const status = row[9] || '';
    
    // Check for generic emails
    const hasGenericEmail = email && (
      email.toLowerCase().startsWith('info@') ||
      email.toLowerCase().startsWith('sales@') ||
      email.toLowerCase().startsWith('ir@') ||
      email.toLowerCase().startsWith('admin@') ||
      email.toLowerCase().startsWith('contact@')
    );
    
    const isDead = status && status.toLowerCase().includes('dead');
    
    // Need enrichment if: no contact name OR no email OR generic email
    if (!isDead && firm.trim() && (
      !contactName.trim() || 
      !email.trim() || 
      hasGenericEmail
    )) {
      needsEnrichment.push({
        rowIndex: i + 1,
        firm,
        website,
        contactName: contactName || '(empty)',
        title: title || '(empty)',
        email: email || '(empty)',
        status: status || '(empty)',
        reason: !contactName.trim() ? 'No contact name' :
                !email.trim() ? 'No email' :
                hasGenericEmail ? `Generic email: ${email}` :
                'Unknown'
      });
    }
  }
  
  console.log(`\n🎯 Found ${needsEnrichment.length} leads needing enrichment\n`);
  console.log('═'.repeat(120) + '\n');
  
  // Show first 20 in detail
  needsEnrichment.slice(0, 20).forEach((lead, i) => {
    console.log(`${i + 1}. Row ${lead.rowIndex}: ${lead.firm}`);
    console.log(`   Website: ${lead.website || '(empty)'}`);
    console.log(`   Current Contact: ${lead.contactName}`);
    console.log(`   Current Title: ${lead.title}`);
    console.log(`   Current Email: ${lead.email}`);
    console.log(`   Status: ${lead.status}`);
    console.log(`   Reason: ${lead.reason}`);
    console.log('');
  });
  
  // Save the full list
  fs.writeFileSync(
    'enrichment-needs-march9-306pm.json',
    JSON.stringify(needsEnrichment, null, 2)
  );
  
  console.log('═'.repeat(120));
  console.log(`\n✅ Full list saved to enrichment-needs-march9-306pm.json`);
  console.log(`   Total needing enrichment: ${needsEnrichment.length}`);
  console.log(`   Priority (no contact): ${needsEnrichment.filter(l => l.reason === 'No contact name').length}`);
  console.log(`   No email: ${needsEnrichment.filter(l => l.reason === 'No email').length}`);
  console.log(`   Generic email: ${needsEnrichment.filter(l => l.reason.includes('Generic')).length}\n`);
}

inspectSheet().catch(console.error);
