const { google } = require('googleapis');
const fs = require('fs');

async function findUniqueEnrichmentNeeds() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A:M'
    });
    
    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found');
      return;
    }
    
    const headers = rows[0];
    console.log('Column headers:', headers);
    console.log('');
    
    // Track unique companies
    const companyMap = new Map();
    const targets = [];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const company = (row[0] || '').trim();
      const website = (row[1] || '').trim();
      const contact = (row[2] || '').trim();
      const title = (row[3] || '').trim();
      const email = (row[4] || '').trim();
      const linkedin = (row[6] || '').trim();
      const status = (row[9] || '').trim();
      const notes = (row[8] || '').trim();
      
      // Skip empty companies
      if (!company) continue;
      
      // Skip dead status
      if (status.toLowerCase().includes('dead')) continue;
      
      // Check if needs enrichment
      const hasEmptyContact = !contact || contact.toLowerCase() === 'research';
      const hasGenericEmail = email && (
        email.toLowerCase().includes('info@') || 
        email.toLowerCase().includes('sales@') || 
        email.toLowerCase().includes('ir@') || 
        email.toLowerCase().includes('contact@') ||
        email.toLowerCase().includes('media@') ||
        email.toLowerCase().includes('press@')
      );
      const hasNoEmail = !email;
      
      const needsEnrichment = hasEmptyContact || hasGenericEmail || hasNoEmail;
      
      if (needsEnrichment) {
        // Use the first occurrence of each company (deduplicate)
        if (!companyMap.has(company)) {
          companyMap.set(company, {
            row: i + 1,
            company,
            website,
            contact,
            title,
            email,
            linkedin,
            status,
            notes
          });
        }
      }
    }
    
    // Convert map to array and take first 15
    const uniqueTargets = Array.from(companyMap.values()).slice(0, 15);
    
    console.log(`\n=== UNIQUE FIRMS NEEDING ENRICHMENT ===\n`);
    uniqueTargets.forEach((target, idx) => {
      console.log(`${idx + 1}. ${target.company}`);
      console.log(`   Row: ${target.row}`);
      console.log(`   Website: ${target.website || 'EMPTY'}`);
      console.log(`   Contact: ${target.contact || 'EMPTY'}`);
      console.log(`   Title: ${target.title || 'EMPTY'}`);
      console.log(`   Email: ${target.email || 'EMPTY'}`);
      console.log(`   Status: ${target.status || 'EMPTY'}`);
      console.log('');
    });
    
    console.log(`Total unique firms needing enrichment: ${uniqueTargets.length}`);
    console.log(`\n=== SAVING TO enrichment-targets.json ===`);
    
    fs.writeFileSync('enrichment-targets.json', JSON.stringify(uniqueTargets, null, 2));
    console.log('Saved to enrichment-targets.json');
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

findUniqueEnrichmentNeeds();
