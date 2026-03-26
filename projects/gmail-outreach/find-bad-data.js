const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function findBadData() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const data = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:L',
  });
  
  const rows = data.data.values;
  const targets = [];
  
  rows.forEach((row, idx) => {
    if (idx === 0) return; // Skip header
    const company = (row[0] || '').trim();
    const website = (row[1] || '').trim();
    const contact = (row[2] || '').trim();
    const title = (row[3] || '').trim();
    const email = (row[4] || '').trim();
    const linkedin = (row[6] || '').trim();
    const status = (row[7] || '').trim();
    
    // Skip empty rows or header
    if (!company || company === 'Company Name') return;
    
    // Flag if:
    // 1. No contact name
    // 2. No email
    // 3. Generic email (info@, sales@, etc.)
    // 4. Email domain doesn't match company (wrong firm)
    // 5. Status is EMPTY or not "Enriched"
    
    let needsWork = false;
    let reason = [];
    
    if (!contact) {
      needsWork = true;
      reason.push('NO CONTACT');
    }
    
    if (!email) {
      needsWork = true;
      reason.push('NO EMAIL');
    } else if (email.match(/^(info|sales|ir|contact|admin|general)@/i)) {
      needsWork = true;
      reason.push('GENERIC EMAIL');
    }
    
    // Check if email domain seems wrong (very basic check)
    if (email && company) {
      const emailDomain = email.split('@')[1];
      const companySlug = company.toLowerCase().replace(/[^a-z0-9]/g, '');
      const domainSlug = emailDomain ? emailDomain.split('.')[0].toLowerCase() : '';
      
      // If they're very different, might be mismatched
      if (domainSlug && companySlug && !companySlug.includes(domainSlug) && !domainSlug.includes(companySlug.substring(0, 5))) {
        // Could be mismatched
        reason.push('POSSIBLE MISMATCH');
      }
    }
    
    if (!status || status === 'EMPTY' || status === '') {
      needsWork = true;
      reason.push('EMPTY STATUS');
    }
    
    if (needsWork) {
      targets.push({ 
        row: idx + 1, 
        company, 
        website,
        contact, 
        title,
        email, 
        linkedin,
        status,
        reason: reason.join(' | ')
      });
    }
  });
  
  console.log(`Found ${targets.length} firms needing enrichment/fixing:\n`);
  targets.slice(0, 20).forEach(t => {
    console.log(`Row ${t.row}: ${t.company}`);
    console.log(`  Issues: ${t.reason}`);
    console.log(`  Website: ${t.website || 'MISSING'}`);
    console.log(`  Contact: ${t.contact || 'MISSING'}`);
    console.log(`  Title: ${t.title || 'MISSING'}`);
    console.log(`  Email: ${t.email || 'MISSING'}`);
    console.log(`  Status: ${t.status || 'MISSING'}`);
    console.log('');
  });
  
  console.log(`\nShowing first 20 of ${targets.length} total targets.`);
  
  // Save full list to file
  const fs = require('fs');
  fs.writeFileSync('enrichment-targets.json', JSON.stringify(targets, null, 2));
  console.log('\nFull list saved to enrichment-targets.json');
}

findBadData().catch(console.error);
