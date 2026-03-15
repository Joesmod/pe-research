const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Read sheet
async function readSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:M'
  });
  
  return response.data.values || [];
}

// Main
async function main() {
  console.log('Reading sheet...');
  const rows = await readSheet();
  console.log(`Loaded ${rows.length} rows\n`);
  
  // Find leads needing enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0];
    const website = row[1];
    const contactName = row[2];
    const email = row[4];
    const status = row[9];
    
    // Skip dead/contacted/sent leads
    if (status && (status.toLowerCase().includes('dead') || 
                  status.toLowerCase().includes('contacted') ||
                  status.toLowerCase().includes('sent'))) {
      continue;
    }
    
    // Check if needs enrichment
    const hasGenericEmail = email && (email.includes('info@') || email.includes('sales@') || 
                                      email.includes('ir@') || email.includes('contact@') ||
                                      email.includes('press@') || email.includes('media@'));
    const hasNoContactName = !contactName || contactName.trim() === '';
    const hasNoEmail = !email || email.trim() === '';
    
    if ((hasGenericEmail || hasNoContactName || hasNoEmail) && website) {
      needsEnrichment.push({
        rowIndex: i + 1,
        company: company || 'Unknown',
        website: website,
        contactName: contactName || '',
        email: email || '',
        status: status || ''
      });
    }
  }
  
  console.log(`\nFound ${needsEnrichment.length} leads needing enrichment\n`);
  console.log('First 30 firms needing enrichment:\n');
  
  needsEnrichment.slice(0, 30).forEach((lead, idx) => {
    console.log(`${idx + 1}. ${lead.company}`);
    console.log(`   Website: ${lead.website}`);
    console.log(`   Current Contact: ${lead.contactName || 'EMPTY'}`);
    console.log(`   Current Email: ${lead.email || 'EMPTY'}`);
    console.log(`   Status: ${lead.status || 'none'}`);
    console.log('');
  });
  
  // Save to file for reference
  fs.writeFileSync(
    'enrich-targets-march7-336am.json',
    JSON.stringify(needsEnrichment, null, 2)
  );
  
  console.log(`\nSaved ${needsEnrichment.length} targets to enrich-targets-march7-336am.json`);
}

main().catch(console.error);
