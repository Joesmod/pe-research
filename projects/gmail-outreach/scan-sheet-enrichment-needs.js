const { google } = require('googleapis');
const fs = require('fs');

async function scanSheet() {
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
    
    console.log(`Headers: ${JSON.stringify(rows[0])}`);
    
    // Skip header row
    const dataRows = rows.slice(1);
    
    const needsEnrichment = [];
    
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const company = (row[0] || '').trim();
      const website = (row[1] || '').trim();
      const contact = (row[2] || '').trim();
      const title = (row[3] || '').trim();
      const email = (row[4] || '').trim();
      const linkedin = (row[6] || '').trim();
      const notes = (row[8] || '').trim();
      const status = (row[9] || '').trim();
      
      // Skip if no company name or dead status
      if (!company || status.toLowerCase().includes('dead')) continue;
      
      // Check if needs enrichment
      const hasNoContact = !contact || contact.toLowerCase() === 'research' || contact === 'EMPTY' || contact.length < 3;
      
      const hasGenericEmail = email && (
        email.toLowerCase().includes('info@') || 
        email.toLowerCase().includes('sales@') || 
        email.toLowerCase().includes('ir@') || 
        email.toLowerCase().includes('contact@') ||
        email.toLowerCase().includes('media@') ||
        email.toLowerCase().includes('press@') ||
        email.toLowerCase().includes('team@') ||
        email === 'EMPTY'
      );
      
      const hasNoEmail = !email || email === 'EMPTY' || email.length < 5;
      
      if (hasNoContact || hasGenericEmail || hasNoEmail) {
        needsEnrichment.push({
          rowNumber: i + 2, // +2 because we skipped header and arrays are 0-indexed
          company,
          website,
          contact: contact || 'EMPTY',
          title: title || '',
          email: email || 'EMPTY',
          linkedin: linkedin || '',
          status: status || '',
          notes: notes || '',
          reason: {
            noContact: hasNoContact,
            genericEmail: hasGenericEmail,
            noEmail: hasNoEmail
          }
        });
      }
    }
    
    console.log(`\n=== ENRICHMENT NEEDS SUMMARY ===`);
    console.log(`Total rows in sheet: ${rows.length}`);
    console.log(`Data rows (excluding header): ${dataRows.length}`);
    console.log(`Rows needing enrichment: ${needsEnrichment.length}`);
    
    // Take top 15 for this run
    const top15 = needsEnrichment.slice(0, 15);
    
    console.log(`\n=== TOP 15 FIRMS NEEDING ENRICHMENT ===\n`);
    top15.forEach((item, idx) => {
      console.log(`${idx + 1}. ${item.company} (Row ${item.rowNumber})`);
      console.log(`   Website: ${item.website}`);
      console.log(`   Contact: ${item.contact}`);
      console.log(`   Email: ${item.email}`);
      console.log(`   Reason: ${Object.entries(item.reason).filter(([k,v]) => v).map(([k,v]) => k).join(', ')}`);
      console.log('');
    });
    
    fs.writeFileSync('enrichment-targets.json', JSON.stringify(top15, null, 2));
    console.log(`Saved ${top15.length} targets to enrichment-targets.json`);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

scanSheet();
