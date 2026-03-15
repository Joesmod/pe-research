const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function findEnrichmentTargets() {
  try {
    const credentials = JSON.parse(fs.readFileSync('service-account.json', 'utf8'));
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
    
    // Read the full sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1'  // Read all columns
    });
    
    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found.');
      return;
    }

    // Parse headers
    const headers = rows[0];
    console.log('Headers:', headers);
    
    const colCompany = headers.indexOf('Company');
    const colContact = headers.indexOf('Contact Name');
    const colTitle = headers.indexOf('Position/Title');
    const colEmail = headers.indexOf('Email');
    const colLinkedIn = headers.indexOf('LinkedIn');
    const colStatus = headers.indexOf('Status');
    const colNotes = headers.indexOf('Notes');
    const colWebsite = headers.indexOf('Website');

    // Find leads needing enrichment (skip header row)
    const targets = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const company = row[colCompany] || '';
      const contact = row[colContact] || '';
      const email = row[colEmail] || '';
      const status = row[colStatus] || '';
      const website = row[colWebsite] || '';
      
      // Skip if status is Sent, Bounced, Replied, or Dead
      if (status && ['Sent', 'Bounced', 'Replied', 'Dead', 'Not PE'].includes(status)) {
        continue;
      }
      
      // Check if needs enrichment
      const needsContact = !contact || contact.trim() === '';
      const needsEmail = !email || email.trim() === '' || 
                          email.includes('info@') || 
                          email.includes('sales@') || 
                          email.includes('ir@') ||
                          email.includes('contact@') ||
                          email.includes('hello@');
      
      if (needsContact || needsEmail) {
        targets.push({
          rowIndex: i + 1, // 1-indexed for Google Sheets
          company,
          contact,
          email,
          status,
          website,
          needsContact,
          needsEmail
        });
      }
    }

    console.log(`\nFound ${targets.length} leads needing enrichment:\n`);
    
    // Limit to 15 for this run
    const batch = targets.slice(0, 15);
    
    batch.forEach((t, idx) => {
      console.log(`${idx + 1}. Row ${t.rowIndex}: ${t.company}`);
      console.log(`   Current Contact: ${t.contact || '(empty)'}`);
      console.log(`   Current Email: ${t.email || '(empty)'}`);
      console.log(`   Website: ${t.website || '(none)'}`);
      console.log(`   Needs: ${t.needsContact ? 'Contact Name ' : ''}${t.needsEmail ? 'Email' : ''}`);
      console.log('');
    });

    // Save targets for enrichment
    fs.writeFileSync('enrichment-targets-march13-737pm.json', JSON.stringify(batch, null, 2));
    console.log(`\nSaved ${batch.length} targets to enrichment-targets-march13-737pm.json`);
    console.log('\nNext step: Research each firm manually using:');
    console.log('- Firm website /team or /about pages');
    console.log('- LinkedIn searches (site:linkedin.com "firm name" AND "Partner")');
    console.log('- Press releases and conference bios');
    console.log('- SEC filings for portfolio company boards');
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

findEnrichmentTargets();
