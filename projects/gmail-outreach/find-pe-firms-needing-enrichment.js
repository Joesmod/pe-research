const { google } = require('googleapis');
const fs = require('fs');

async function findPEFirms() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:J',
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  const headers = rows[0];
  console.log('Total rows:', rows.length - 1);
  
  // Keywords that suggest NOT a PE firm
  const excludeKeywords = [
    'search', 'partners', 'advisors', 'recruiting', 'placement', 
    'executive', 'talent', 'headhunt', 'consulting', 'advisory'
  ];
  
  // Find leads needing enrichment (skip ones we just marked as Dead)
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const firm = (row[0] || '').toLowerCase();
    const contactName = row[2] || '';
    const email = row[4] || '';
    const status = (row[9] || '').toLowerCase();
    
    // Skip if status is Dead
    if (status === 'dead') continue;
    
    // Skip if firm name suggests it's NOT a PE firm
    const likelyNotPE = excludeKeywords.some(kw => firm.includes(kw));
    
    // Check if needs enrichment
    const noContact = !contactName || contactName.trim() === '' || contactName === 'Jacob Zodikoff';
    const genericEmail = !email || 
                        email.includes('info@') || 
                        email.includes('sales@') || 
                        email.includes('ir@') ||
                        email.includes('contact@') ||
                        email.trim() === '';
    
    if ((noContact || genericEmail) && !likelyNotPE) {
      needsEnrichment.push({
        row: i + 1,
        firm: row[0],
        contactName,
        email,
        website: row[5] || '',
        status: row[9] || '',
        reason: noContact ? 'No contact name' : 'Generic/missing email'
      });
    }
  }
  
  console.log('\n=== LIKELY PE FIRMS NEEDING ENRICHMENT ===');
  console.log(`Found ${needsEnrichment.length} potential PE firms\n`);
  
  // Show first 20
  const toEnrich = needsEnrichment.slice(0, 20);
  toEnrich.forEach((lead, idx) => {
    console.log(`${idx + 1}. ${lead.firm}`);
    console.log(`   Row: ${lead.row} | Contact: "${lead.contactName}" | Email: "${lead.email}"`);
    console.log(`   Website: ${lead.website}`);
    console.log('');
  });
  
  // Save to file
  fs.writeFileSync('pe-firms-batch-2.json', JSON.stringify(toEnrich, null, 2));
  console.log(`\nSaved ${toEnrich.length} leads to pe-firms-batch-2.json`);
}

findPEFirms().catch(console.error);
