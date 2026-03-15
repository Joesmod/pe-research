const { google } = require('googleapis');
const fs = require('fs');

async function readSheetForEnrichment() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
    
    console.log('Reading Sheet1...');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A:M'
    });
    
    const rows = response.data.values;
    if (!rows || rows.length < 2) {
      console.log('No data found or only headers');
      return;
    }
    
    console.log(`Total rows: ${rows.length}`);
    console.log('\n=== TOP 15 ENRICHMENT TARGETS ===\n');
    
    const targets = [];
    let count = 0;
    
    for (let i = 1; i < rows.length && count < 15; i++) {
      const row = rows[i];
      const company = row[0] || '';
      const position = row[1] || '';
      const contact = row[2] || '';
      const title = row[3] || '';
      const email = row[4] || '';
      const website = row[5] || '';
      const linkedin = row[6] || '';
      const status = row[9] || '';
      
      // Skip dead/sent/replied leads
      const lowerStatus = status.toLowerCase();
      if (lowerStatus.includes('dead') || 
          lowerStatus.includes('sent') || 
          lowerStatus.includes('replied') || 
          lowerStatus.includes('contacted')) {
        continue;
      }
      
      // Target for enrichment if:
      // - No contact name
      // - No email OR generic email (info@, sales@, ir@, contact@)
      // - Status indicates unresearched/partial
      
      const noContact = !contact || contact.trim() === '';
      const noEmail = !email || email.trim() === '';
      const genericEmail = email && (
        email.startsWith('info@') ||
        email.startsWith('sales@') ||
        email.startsWith('ir@') ||
        email.startsWith('contact@')
      );
      const unresearched = lowerStatus.includes('unresearched') || 
                          lowerStatus.includes('partial') ||
                          lowerStatus === '';
      
      if (noContact || noEmail || genericEmail || unresearched) {
        count++;
        const target = {
          row: i + 1,
          company,
          position,
          contact: contact || '[EMPTY]',
          title: title || '[EMPTY]',
          email: email || '[EMPTY]',
          website,
          linkedin,
          status: status || '[NEW]',
          issue: []
        };
        
        if (noContact) target.issue.push('No Contact');
        if (noEmail) target.issue.push('No Email');
        if (genericEmail) target.issue.push('Generic Email');
        if (unresearched) target.issue.push('Unresearched');
        
        targets.push(target);
        
        console.log(`${count}. Row ${target.row}: ${company}`);
        console.log(`   Position: ${position}`);
        console.log(`   Contact: ${target.contact}`);
        console.log(`   Email: ${target.email}`);
        console.log(`   Website: ${website || '[NONE]'}`);
        console.log(`   Status: ${target.status}`);
        console.log(`   Issues: ${target.issue.join(', ')}`);
        console.log('');
      }
    }
    
    console.log(`\n✓ Found ${count} leads needing enrichment`);
    
    fs.writeFileSync('enrichment-targets.json', JSON.stringify(targets, null, 2));
    console.log('✓ Saved to enrichment-targets.json\n');
    
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

readSheetForEnrichment();
