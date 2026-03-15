const { google } = require('googleapis');
const fs = require('fs');

async function findEnrichmentTargets() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
    
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A:K',
    });
    
    const rows = result.data.values;
    const headers = rows[0];
    
    const needsEnrichment = [];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;
      
      const company = row[0] || '';
      const contact = row[2] || '';
      const email = row[4] || '';
      const status = row[9] || '';
      
      // Skip dead leads
      if (status.toLowerCase().includes('dead')) continue;
      
      // Check if needs enrichment
      const emptyContact = !contact || contact.trim() === '';
      const noEmail = !email || email.trim() === '';
      const emailIsTitle = email && !email.includes('@') && (email.toLowerCase().includes('partner') || email.toLowerCase().includes('president') || email.toLowerCase().includes('founder') || email.toLowerCase().includes('ceo') || email.toLowerCase().includes('director') || email.toLowerCase().includes('vp'));
      const genericEmail = email && email.includes('@') && (email.includes('info@') || email.includes('sales@') || email.includes('ir@') || email.includes('contact@'));
      
      let reasons = [];
      if (emptyContact) reasons.push('No contact name');
      if (noEmail) reasons.push('No email');
      if (emailIsTitle) reasons.push('Email field contains job title');
      if (genericEmail) reasons.push('Generic email');
      
      if (reasons.length > 0) {
        needsEnrichment.push({
          rowIndex: i + 1,
          company,
          contact,
          email,
          status,
          reasons: reasons.join(', ')
        });
      }
    }
    
    console.log(`\nFound ${needsEnrichment.length} leads needing enrichment\n`);
    
    // Show first 15
    console.log('First 15 targets:\n');
    needsEnrichment.slice(0, 15).forEach(lead => {
      console.log(`Row ${lead.rowIndex}: ${lead.company}`);
      console.log(`  Contact: ${lead.contact || '(empty)'}`);
      console.log(`  Email: ${lead.email || '(empty)'}`);
      console.log(`  Reasons: ${lead.reasons}`);
      console.log('');
    });
    
    fs.writeFileSync('enrichment-targets-march6-406pm.json', JSON.stringify(needsEnrichment, null, 2));
    console.log(`\nSaved ${needsEnrichment.length} targets to enrichment-targets-march6-406pm.json`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

findEnrichmentTargets();
