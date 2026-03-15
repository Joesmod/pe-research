const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = './service-account.json';

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read from Sheet1
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:Z',
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }

  // Column mapping based on the actual structure
  // A=Company Name, B=NotebookLM, C=Contact, D=Title, E=Email, F=Website, G=LinkedIn, H=Status/Enriched, I=Notes
  
  console.log(`\n📊 Total rows: ${rows.length}`);
  
  const needsEnrichment = [];
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || ''; // Company Name (A)
    const contact = row[2] || '';  // Contact Name (C)
    const title = row[3] || '';    // Title (D)
    const email = row[4] || '';    // Email (E)
    const website = row[5] || '';  // Website (F)
    const status = row[7] || '';   // Status (H)
    
    // Skip header row if it says "Company Name"
    if (company === 'Company Name') continue;
    
    // Skip if no company name
    if (!company || company.trim() === '') continue;
    
    // Skip if already sent or dead
    if (status && (status.toLowerCase().includes('sent') || status.toLowerCase().includes('dead'))) {
      continue;
    }
    
    // Check if needs enrichment
    const noContact = !contact || contact.trim() === '';
    const genericEmail = email && (
      email.toLowerCase().startsWith('info@') || 
      email.toLowerCase().startsWith('sales@') || 
      email.toLowerCase().startsWith('ir@') ||
      email.toLowerCase().startsWith('contact@') ||
      email.toLowerCase().startsWith('hello@') ||
      email.toLowerCase().startsWith('support@')
    );
    const noEmail = !email || email.trim() === '';
    
    if (noContact || genericEmail || noEmail) {
      needsEnrichment.push({
        rowIndex: i + 1, // 1-indexed for sheet (row number in spreadsheet)
        company,
        contact,
        title,
        email,
        website,
        status,
        reason: [
          noContact ? 'No contact' : null,
          noEmail ? 'No email' : null,
          genericEmail ? `Generic email (${email})` : null
        ].filter(Boolean).join(', ')
      });
    }
  }

  console.log(`\n✅ Found ${needsEnrichment.length} leads needing enrichment\n`);
  
  // Take first 15 for this run
  const batch = needsEnrichment.slice(0, 15);
  
  console.log(`📋 Batch of ${batch.length} to research:\n`);
  console.log('─'.repeat(80));
  batch.forEach((lead, idx) => {
    console.log(`\n${idx + 1}. ${lead.company} (Row ${lead.rowIndex})`);
    console.log(`   Current contact: ${lead.contact || '[EMPTY]'}`);
    console.log(`   Current email: ${lead.email || '[EMPTY]'}`);
    console.log(`   Website: ${lead.website || '[EMPTY]'}`);
    console.log(`   Status: ${lead.status || '[EMPTY]'}`);
    console.log(`   ⚠️  ${lead.reason}`);
  });

  // Save to file for enrichment
  fs.writeFileSync(
    'enrichment-targets-march14-real.json',
    JSON.stringify(batch, null, 2)
  );
  
  console.log(`\n\n💾 Saved ${batch.length} targets to enrichment-targets-march14-real.json`);
  console.log(`\n🎯 Next: Use Apollo.io API to search for contacts at these firms`);
}

main().catch(console.error);
