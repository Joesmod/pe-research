const { google } = require('googleapis');

async function findActiveNeeds() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

    const result = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A:J'
    });

    const rows = result.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found');
      return;
    }

    const headers = rows[0];
    const contactIdx = headers.indexOf('Contact Name');
    const emailIdx = headers.indexOf('Email');
    const statusIdx = headers.indexOf('Status');
    const companyIdx = headers.indexOf('Company Name');
    const websiteIdx = headers.indexOf('Website');
    
    const activeNeedsEnrichment = [];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const status = (row[statusIdx] || '').toLowerCase();
      
      // Skip Dead firms
      if (status.includes('dead')) continue;
      
      const company = row[companyIdx] || '';
      const contact = row[contactIdx] || '';
      const email = row[emailIdx] || '';
      const website = row[websiteIdx] || '';
      
      const hasEmptyContact = !contact.trim();
      const hasGenericEmail = /^(info|sales|ir|contact|admin|support)@/.test(email.toLowerCase());
      const hasEmptyEmail = !email.trim();
      
      if (hasEmptyContact || hasGenericEmail || hasEmptyEmail) {
        activeNeedsEnrichment.push({
          row: i + 1,
          company,
          website,
          contact,
          email,
          status
        });
      }
    }
    
    console.log(`Found ${activeNeedsEnrichment.length} ACTIVE firms needing enrichment (excluding Dead)`);
    console.log('\nFirst 15 active firms needing enrichment:');
    activeNeedsEnrichment.slice(0, 15).forEach(lead => {
      console.log(`Row ${lead.row}: ${lead.company}`);
      console.log(`  Website: ${lead.website}`);
      console.log(`  Current Contact: "${lead.contact}"`);
      console.log(`  Current Email: "${lead.email}"`);
      console.log(`  Status: "${lead.status}"`);
      console.log('');
    });
    
    const fs = require('fs');
    fs.writeFileSync('active-enrichment-targets-march10.json', JSON.stringify(activeNeedsEnrichment.slice(0, 15), null, 2));
    console.log(`\nWrote 15 active targets to active-enrichment-targets-march10.json`);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  }
}

findActiveNeeds();
