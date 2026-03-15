const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function analyzeEnrichmentNeeds() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:I'
  });
  
  const rows = res.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }

  // Skip header
  const headers = rows[0];
  const dataRows = rows.slice(1);
  
  const needsEnrichment = [];
  
  dataRows.forEach((row, index) => {
    const firm = row[0] || '';
    const website = row[1] || '';
    const contactName = row[2] || '';
    const title = row[3] || '';
    const email = row[4] || '';
    const status = row[8] || '';
    
    // Check if needs enrichment:
    // 1. Empty contact name
    // 2. Generic email (info@, sales@, ir@, admin@, etc.)
    // 3. Missing email
    // 4. Status is not "Enriched" or "Dead Lead"
    
    const hasGenericEmail = email && (
      email.toLowerCase().startsWith('info@') ||
      email.toLowerCase().startsWith('sales@') ||
      email.toLowerCase().startsWith('ir@') ||
      email.toLowerCase().startsWith('admin@') ||
      email.toLowerCase().startsWith('contact@')
    );
    
    const isDead = status.toLowerCase().includes('dead');
    
    if (!isDead && (
      !contactName.trim() || 
      !email.trim() || 
      hasGenericEmail ||
      (status !== 'Enriched')
    )) {
      needsEnrichment.push({
        rowIndex: index + 2, // +2 because of header and 1-based indexing
        firm,
        website,
        contactName,
        title,
        email,
        status,
        reason: !contactName ? 'No contact name' : 
                !email ? 'No email' : 
                hasGenericEmail ? 'Generic email' : 
                'Status not enriched'
      });
    }
  });

  // Sort by priority (no contact name first, then generic email, then missing status)
  needsEnrichment.sort((a, b) => {
    const priorityA = !a.contactName ? 3 : a.reason === 'Generic email' ? 2 : 1;
    const priorityB = !b.contactName ? 3 : b.reason === 'Generic email' ? 2 : 1;
    return priorityB - priorityA;
  });

  console.log(`\nFound ${needsEnrichment.length} leads that need enrichment:\n`);
  
  // Show top 20 for review
  const top20 = needsEnrichment.slice(0, 20);
  
  top20.forEach((lead, i) => {
    console.log(`${i + 1}. Row ${lead.rowIndex}: ${lead.firm}`);
    console.log(`   Website: ${lead.website}`);
    console.log(`   Current Contact: ${lead.contactName || '(empty)'}`);
    console.log(`   Current Email: ${lead.email || '(empty)'}`);
    console.log(`   Reason: ${lead.reason}`);
    console.log('');
  });

  // Save to file for reference
  fs.writeFileSync(
    'enrichment-needs-march9-906am.json',
    JSON.stringify(needsEnrichment, null, 2)
  );
  
  console.log(`\n✓ Full list saved to enrichment-needs-march9-906am.json`);
  console.log(`  Total: ${needsEnrichment.length} leads need enrichment`);
  console.log(`  Priority (no contact): ${needsEnrichment.filter(l => !l.contactName).length}`);
  console.log(`  Generic email: ${needsEnrichment.filter(l => l.reason === 'Generic email').length}`);
}

analyzeEnrichmentNeeds().catch(console.error);
